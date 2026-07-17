package com.ats.backend.service.impl;

import com.ats.backend.dto.InterviewDto;
import com.ats.backend.dto.ScheduleInterviewRequest;
import com.ats.backend.dto.UpdateInterviewRequest;
import com.ats.backend.entity.*;
import com.ats.backend.event.ApplicationPipelineEvent;
import com.ats.backend.exception.ConflictException;
import com.ats.backend.exception.InvalidRequestException;
import com.ats.backend.exception.ResourceNotFoundException;
import com.ats.backend.mapper.InterviewMapper;
import com.ats.backend.repository.ApplicationRepository;
import com.ats.backend.repository.ApplicationStatusHistoryRepository;
import com.ats.backend.repository.InterviewRepository;
import com.ats.backend.repository.UserRepository;
import com.ats.backend.service.InterviewService;
import com.ats.backend.service.NotificationService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final NotificationService notificationService;
    private final InterviewMapper interviewMapper;
    private final ApplicationEventPublisher eventPublisher;

    public InterviewServiceImpl(
            InterviewRepository interviewRepository,
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            ApplicationStatusHistoryRepository statusHistoryRepository,
            NotificationService notificationService,
            InterviewMapper interviewMapper,
            ApplicationEventPublisher eventPublisher
    ) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.notificationService = notificationService;
        this.interviewMapper = interviewMapper;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public InterviewDto scheduleInterview(ScheduleInterviewRequest request, String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found: " + recruiterEmail));

        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + request.getApplicationId()));

        // Security check: Recruiter must own the job or be ADMIN
        boolean isAdmin = recruiter.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        if (!isAdmin && !application.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            throw new InvalidRequestException("You are not authorized to schedule interviews for this application.");
        }

        // Validate application status: Prevent scheduling for rejected or withdrawn applications
        ApplicationStatus currentAppStatus = application.getStatus();
        if (currentAppStatus == ApplicationStatus.REJECTED || currentAppStatus == ApplicationStatus.WITHDRAWN) {
            throw new InvalidRequestException("Cannot schedule interviews for rejected or withdrawn applications.");
        }

        // Validate scheduled date time
        if (request.getScheduledDateTime().isBefore(LocalDateTime.now())) {
            throw new InvalidRequestException("Cannot schedule an interview in the past.");
        }

        // Validate duration
        if (request.getDuration() <= 0) {
            throw new InvalidRequestException("Interview duration must be greater than zero.");
        }

        // Fetch interviewer
        User interviewer = userRepository.findById(request.getInterviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Interviewer not found with id: " + request.getInterviewerId()));

        if (!interviewer.isEnabled()) {
            throw new InvalidRequestException("Selected interviewer is not enabled.");
        }

        // Check for duplicate interview at the exact same time for the same application
        List<Interview> existingInterviews = interviewRepository.findByApplicationIdOrderByScheduledDateTimeDesc(application.getId());
        boolean duplicateExists = existingInterviews.stream().anyMatch(i -> 
                i.getStatus() != InterviewStatus.CANCELLED && 
                i.getScheduledDateTime().equals(request.getScheduledDateTime())
        );
        if (duplicateExists) {
            throw new ConflictException("An interview is already scheduled for this application at the specified time.");
        }

        // Save Interview entity
        Interview interview = Interview.builder()
                .application(application)
                .recruiter(recruiter)
                .interviewer(interviewer)
                .candidate(application.getCandidate())
                .scheduledDateTime(request.getScheduledDateTime())
                .duration(request.getDuration())
                .interviewMode(request.getInterviewMode())
                .meetingLink(request.getMeetingLink())
                .location(request.getLocation())
                .interviewRound(request.getInterviewRound())
                .status(InterviewStatus.SCHEDULED)
                .notes(request.getNotes())
                .build();

        Interview savedInterview = interviewRepository.save(interview);

        // Workflow automation: update application status
        if (currentAppStatus != ApplicationStatus.INTERVIEW_SCHEDULED) {
            application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
            applicationRepository.save(application);

            // Audit status history
            ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                    .application(application)
                    .previousStatus(currentAppStatus)
                    .newStatus(ApplicationStatus.INTERVIEW_SCHEDULED)
                    .changedBy(recruiter)
                    .note("Interview scheduled (" + request.getInterviewRound().name() + " round).")
                    .build();
            statusHistoryRepository.save(history);

            // Publish pipeline event (sends emails, etc.)
            eventPublisher.publishEvent(new ApplicationPipelineEvent(
                    application, currentAppStatus, ApplicationStatus.INTERVIEW_SCHEDULED, recruiter,
                    "Interview scheduled (" + request.getInterviewRound().name() + " round).",
                    ApplicationPipelineEvent.ActionType.STATUS_UPDATED));
        } else {
            // Already in INTERVIEW_SCHEDULED, audit additional interview
            ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                    .application(application)
                    .previousStatus(ApplicationStatus.INTERVIEW_SCHEDULED)
                    .newStatus(ApplicationStatus.INTERVIEW_SCHEDULED)
                    .changedBy(recruiter)
                    .note("Additional interview scheduled (" + request.getInterviewRound().name() + " round).")
                    .build();
            statusHistoryRepository.save(history);
        }

        // In-app Notification for Candidate
        notificationService.createNotification(
                application.getCandidate(),
                "Interview Scheduled",
                String.format("An interview (%s round) has been scheduled for %s on %s.",
                        request.getInterviewRound().name(),
                        application.getJob().getTitle(),
                        request.getScheduledDateTime().toString().replace('T', ' ')),
                NotificationType.INTERVIEW_SCHEDULED,
                savedInterview.getId(),
                "/candidate/dashboard"
        );

        return interviewMapper.toDto(savedInterview);
    }

    @Override
    @Transactional
    public InterviewDto updateInterview(Long interviewId, UpdateInterviewRequest request, String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found: " + recruiterEmail));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        Application application = interview.getApplication();

        // Security check: Recruiter must own the job or be ADMIN
        boolean isAdmin = recruiter.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        if (!isAdmin && !application.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            throw new InvalidRequestException("You are not authorized to modify this interview.");
        }

        // Validate scheduled date time
        if (request.getScheduledDateTime().isBefore(LocalDateTime.now())) {
            throw new InvalidRequestException("Cannot reschedule an interview to a past date/time.");
        }

        // Validate duration
        if (request.getDuration() <= 0) {
            throw new InvalidRequestException("Interview duration must be greater than zero.");
        }

        // Fetch interviewer
        User interviewer = userRepository.findById(request.getInterviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Interviewer not found with id: " + request.getInterviewerId()));

        if (!interviewer.isEnabled()) {
            throw new InvalidRequestException("Selected interviewer is not enabled.");
        }

        InterviewStatus oldStatus = interview.getStatus();
        InterviewStatus newStatus = request.getStatus();

        // Detect if rescheduling occurred
        boolean isRescheduled = !interview.getScheduledDateTime().equals(request.getScheduledDateTime());

        interview.setInterviewer(interviewer);
        interview.setScheduledDateTime(request.getScheduledDateTime());
        interview.setDuration(request.getDuration());
        interview.setInterviewMode(request.getInterviewMode());
        interview.setMeetingLink(request.getMeetingLink());
        interview.setLocation(request.getLocation());
        interview.setInterviewRound(request.getInterviewRound());
        interview.setStatus(newStatus);
        interview.setNotes(request.getNotes());

        if (isRescheduled && newStatus == InterviewStatus.SCHEDULED) {
            interview.setStatus(InterviewStatus.RESCHEDULED);
            newStatus = InterviewStatus.RESCHEDULED;
        }

        Interview savedInterview = interviewRepository.save(interview);

        // Audit Trail: Create history record on application
        String auditNote = String.format("Interview (%s round) updated. Status: %s.",
                request.getInterviewRound().name(), newStatus.name());
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(application)
                .previousStatus(application.getStatus())
                .newStatus(application.getStatus())
                .changedBy(recruiter)
                .note(auditNote)
                .build();
        statusHistoryRepository.save(history);

        // Workflow automation: if completed, update application status
        if (newStatus == InterviewStatus.COMPLETED && oldStatus != InterviewStatus.COMPLETED) {
            if (application.getStatus() == ApplicationStatus.INTERVIEW_SCHEDULED) {
                application.setStatus(ApplicationStatus.INTERVIEWED);
                applicationRepository.save(application);

                ApplicationStatusHistory compHistory = ApplicationStatusHistory.builder()
                        .application(application)
                        .previousStatus(ApplicationStatus.INTERVIEW_SCHEDULED)
                        .newStatus(ApplicationStatus.INTERVIEWED)
                        .changedBy(recruiter)
                        .note("Interview completed (" + request.getInterviewRound().name() + " round).")
                        .build();
                statusHistoryRepository.save(compHistory);

                eventPublisher.publishEvent(new ApplicationPipelineEvent(
                        application, ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.INTERVIEWED, recruiter,
                        "Interview completed (" + request.getInterviewRound().name() + " round).",
                        ApplicationPipelineEvent.ActionType.STATUS_UPDATED));
            }
        }

        // In-app Notification for Candidate
        String notificationMsg = isRescheduled
                ? String.format("Your interview (%s round) has been rescheduled to %s.",
                        request.getInterviewRound().name(),
                        request.getScheduledDateTime().toString().replace('T', ' '))
                : String.format("Your interview (%s round) details have been updated.",
                        request.getInterviewRound().name());

        notificationService.createNotification(
                application.getCandidate(),
                isRescheduled ? "Interview Rescheduled" : "Interview Updated",
                notificationMsg,
                NotificationType.APPLICATION_STATUS_UPDATED,
                savedInterview.getId(),
                "/candidate/dashboard"
        );

        return interviewMapper.toDto(savedInterview);
    }

    @Override
    @Transactional
    public InterviewDto cancelInterview(Long interviewId, String note, String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found: " + recruiterEmail));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        Application application = interview.getApplication();

        // Security check: Recruiter must own the job or be ADMIN
        boolean isAdmin = recruiter.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        if (!isAdmin && !application.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            throw new InvalidRequestException("You are not authorized to cancel this interview.");
        }

        if (interview.getStatus() == InterviewStatus.CANCELLED) {
            throw new InvalidRequestException("Interview is already cancelled.");
        }

        // Cancel the interview (soft cancel, preserve record)
        interview.setStatus(InterviewStatus.CANCELLED);
        if (note != null && !note.trim().isEmpty()) {
            String existingNotes = interview.getNotes();
            interview.setNotes(existingNotes != null && !existingNotes.isEmpty() 
                    ? existingNotes + "\nCancellation note: " + note 
                    : "Cancellation note: " + note);
        }
        Interview savedInterview = interviewRepository.save(interview);

        // Audit Trail on Application
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(application)
                .previousStatus(application.getStatus())
                .newStatus(application.getStatus())
                .changedBy(recruiter)
                .note("Interview cancelled (" + interview.getInterviewRound().name() + " round). Reason: " + (note != null ? note : "None"))
                .build();
        statusHistoryRepository.save(history);

        // In-app Notification for Candidate
        notificationService.createNotification(
                application.getCandidate(),
                "Interview Cancelled",
                String.format("Your interview (%s round) for %s has been cancelled.",
                        interview.getInterviewRound().name(),
                        application.getJob().getTitle()),
                NotificationType.GENERAL,
                savedInterview.getId(),
                "/candidate/dashboard"
        );

        return interviewMapper.toDto(savedInterview);
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewDto getInterviewById(Long interviewId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId));

        Application application = interview.getApplication();

        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        boolean isCandidate = interview.getCandidate().getId().equals(user.getId());
        boolean isRecruiter = application.getJob().getRecruiter().getId().equals(user.getId());
        boolean isInterviewer = interview.getInterviewer().getId().equals(user.getId());

        if (!isAdmin && !isCandidate && !isRecruiter && !isInterviewer) {
            throw new InvalidRequestException("You are not authorized to view this interview.");
        }

        return interviewMapper.toDto(interview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewDto> getInterviewsByApplication(Long applicationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        boolean isCandidate = application.getCandidate().getId().equals(user.getId());
        boolean isRecruiter = application.getJob().getRecruiter().getId().equals(user.getId());

        if (!isAdmin && !isCandidate && !isRecruiter) {
            throw new InvalidRequestException("You are not authorized to view interviews for this application.");
        }

        List<Interview> interviews = interviewRepository.findByApplicationIdOrderByScheduledDateTimeDesc(applicationId);
        return interviews.stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewDto> getCandidateInterviews(String candidateEmail) {
        List<Interview> interviews = interviewRepository.findByCandidateEmailOrderByScheduledDateTimeDesc(candidateEmail);
        return interviews.stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewDto> getRecruiterInterviews(String recruiterEmail) {
        List<Interview> interviews = interviewRepository.findByRecruiterEmailOrderByScheduledDateTimeDesc(recruiterEmail);
        return interviews.stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }
}
