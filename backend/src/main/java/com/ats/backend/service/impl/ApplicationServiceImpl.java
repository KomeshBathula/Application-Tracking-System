package com.ats.backend.service.impl;

import com.ats.backend.dto.ApplicationDto;
import com.ats.backend.dto.ApplicationStatusHistoryDto;
import com.ats.backend.entity.*;
import com.ats.backend.exception.ConflictException;
import com.ats.backend.exception.InvalidRequestException;
import com.ats.backend.exception.ResourceNotFoundException;
import com.ats.backend.mapper.ApplicationMapper;
import com.ats.backend.repository.ApplicationRepository;
import com.ats.backend.repository.ApplicationStatusHistoryRepository;
import com.ats.backend.repository.JobRepository;
import com.ats.backend.repository.UserRepository;
import com.ats.backend.service.ApplicationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationMapper applicationMapper;

    public ApplicationServiceImpl(
            ApplicationRepository applicationRepository,
            ApplicationStatusHistoryRepository statusHistoryRepository,
            UserRepository userRepository,
            JobRepository jobRepository,
            ApplicationMapper applicationMapper
    ) {
        this.applicationRepository = applicationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationMapper = applicationMapper;
    }

    @Override
    @Transactional
    public ApplicationDto applyToJob(Long jobId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found: " + candidateEmail));

        // Validation: Prevent applying as recruiter or admin
        if (candidate.getRole().getRoleName() != RoleName.ROLE_CANDIDATE) {
            throw new InvalidRequestException("Only candidates can apply to jobs.");
        }

        // Validation: Prevent applying without an uploaded resume
        if (candidate.getResumeUrl() == null || candidate.getResumeUrl().trim().isEmpty()) {
            throw new InvalidRequestException("Please upload your resume before applying to jobs.");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        // Validation: Prevent applying to closed jobs
        if (job.getStatus() != JobStatus.OPEN) {
            throw new InvalidRequestException("You cannot apply to a closed job.");
        }

        try {
            // Validation: Prevent duplicate applications (Duplicate Application Protection)
            java.util.Optional<Application> existingAppOpt = applicationRepository.findByJobIdAndCandidateId(jobId, candidate.getId());
            if (existingAppOpt.isPresent()) {
                Application existingApp = existingAppOpt.get();
                if (existingApp.getStatus() == ApplicationStatus.WITHDRAWN) {
                    // Reactivate application
                    existingApp.setStatus(ApplicationStatus.APPLIED);
                    existingApp.setResumeUrl(candidate.getResumeUrl());
                    Application savedApplication = applicationRepository.saveAndFlush(existingApp);

                    // Audit Trail: Create history record
                    ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                            .application(savedApplication)
                            .previousStatus(ApplicationStatus.WITHDRAWN)
                            .newStatus(ApplicationStatus.APPLIED)
                            .changedBy(candidate)
                            .note("Application re-submitted after withdrawal.")
                            .build();

                    statusHistoryRepository.saveAndFlush(history);

                    return applicationMapper.toDto(savedApplication);
                } else {
                    throw new ConflictException("You have already applied to this job.");
                }
            }

            // Create Application (Resume snapshot taken at time of application)
            Application application = Application.builder()
                    .candidate(candidate)
                    .job(job)
                    .resumeUrl(candidate.getResumeUrl())
                    .status(ApplicationStatus.APPLIED)
                    .build();

            Application savedApplication = applicationRepository.saveAndFlush(application);

            // Audit Trail: Create initial history record
            ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                    .application(savedApplication)
                    .previousStatus(null)
                    .newStatus(ApplicationStatus.APPLIED)
                    .changedBy(candidate)
                    .note("Application submitted.")
                    .build();

            statusHistoryRepository.saveAndFlush(history);

            return applicationMapper.toDto(savedApplication);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ConflictException("You have already applied to this job.");
        }
    }

    @Override
    @Transactional
    public void withdrawApplication(Long applicationId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + candidateEmail));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        // Security Rule: Candidate may withdraw only their own applications. Admins can withdraw any.
        boolean isAdmin = candidate.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        if (!isAdmin && !application.getCandidate().getId().equals(candidate.getId())) {
            throw new InvalidRequestException("You are not authorized to withdraw this application.");
        }

        ApplicationStatus previousStatus = application.getStatus();
        if (previousStatus == ApplicationStatus.WITHDRAWN) {
            throw new InvalidRequestException("Application is already withdrawn.");
        }

        // Soft delete: update status to WITHDRAWN
        application.setStatus(ApplicationStatus.WITHDRAWN);
        Application savedApplication = applicationRepository.save(application);

        // Audit Trail: Create history record
        String noteText = (candidate.getRole().getRoleName() == RoleName.ROLE_ADMIN)
                ? "Application withdrawn by administrator (" + candidate.getFullName() + ")."
                : "Application withdrawn by candidate.";

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(savedApplication)
                .previousStatus(previousStatus)
                .newStatus(ApplicationStatus.WITHDRAWN)
                .changedBy(candidate)
                .note(noteText)
                .build();

        statusHistoryRepository.save(history);
    }

    @Override
    @Transactional
    public ApplicationDto updateApplicationStatus(Long applicationId, ApplicationStatus newStatus, String note, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        // Security Rule: Recruiter may update status only for jobs they created. Admin can update any.
        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        Job job = application.getJob();
        if (!isAdmin && !job.getRecruiter().getId().equals(user.getId())) {
            throw new InvalidRequestException("You are not authorized to update this application status.");
        }

        ApplicationStatus previousStatus = application.getStatus();

        // Validation: Prevent invalid status transitions
        if (previousStatus == ApplicationStatus.WITHDRAWN) {
            throw new InvalidRequestException("Cannot update the status of a withdrawn application.");
        }

        if (newStatus == ApplicationStatus.WITHDRAWN) {
            throw new InvalidRequestException("Recruiters cannot manually set status to WITHDRAWN. Only candidates may withdraw their applications.");
        }

        if (previousStatus == newStatus) {
            throw new InvalidRequestException("Application status is already " + newStatus);
        }

        // Update status
        application.setStatus(newStatus);
        Application savedApplication = applicationRepository.save(application);

        // Audit Trail: Create history record
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(savedApplication)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .changedBy(user)
                .note(note != null && !note.trim().isEmpty() ? note : "Status updated by " + user.getFullName())
                .build();

        statusHistoryRepository.save(history);

        return applicationMapper.toDto(savedApplication);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationStatusHistoryDto> getApplicationTimeline(Long applicationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        // Security Rule: Candidate may view only their own, Recruiter only for their jobs, Admin unrestricted
        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        boolean isCandidateOwner = application.getCandidate().getId().equals(user.getId());
        boolean isRecruiterOwner = application.getJob().getRecruiter().getId().equals(user.getId());

        if (!isAdmin && !isCandidateOwner && !isRecruiterOwner) {
            throw new InvalidRequestException("You are not authorized to view the history timeline for this application.");
        }

        List<ApplicationStatusHistory> histories = statusHistoryRepository.findByApplicationIdOrderByCreatedAtAsc(applicationId);
        return histories.stream()
                .map(applicationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationDto> getCandidateApplications(String candidateEmail, String status, String search, int page, int size, String sortBy, String sortDir) {
        validateApplicationSortField(sortBy);
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found: " + candidateEmail));

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        ApplicationStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                statusEnum = ApplicationStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new InvalidRequestException("Invalid status filter: " + status);
            }
        }

        String searchPattern = (search == null || search.trim().isEmpty()) ? null : search;

        Page<Application> applicationsPage = applicationRepository.findByCandidateIdWithFilters(
                candidate.getId(), statusEnum, searchPattern, pageable);

        return applicationsPage.map(applicationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationDto> getJobApplications(Long jobId, String recruiterEmail, String status, String search, int page, int size, String sortBy, String sortDir) {
        validateApplicationSortField(sortBy);
        User user = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + recruiterEmail));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        // Security Rule: Recruiter may view applications only for jobs they own. Admin unrestricted.
        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        if (!isAdmin && !job.getRecruiter().getId().equals(user.getId())) {
            throw new InvalidRequestException("You are not authorized to view applicants for this job posting.");
        }

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        ApplicationStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                statusEnum = ApplicationStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new InvalidRequestException("Invalid status filter: " + status);
            }
        }

        String searchPattern = (search == null || search.trim().isEmpty()) ? null : search;

        Page<Application> applicationsPage = applicationRepository.findByJobIdWithFilters(
                jobId, statusEnum, searchPattern, pageable);

        return applicationsPage.map(applicationMapper::toDto);
    }

    private void validateApplicationSortField(String sortBy) {
        java.util.Set<String> allowedFields = java.util.Set.of("id", "createdAt", "updatedAt", "status");
        if (!allowedFields.contains(sortBy)) {
            throw new InvalidRequestException("Invalid sort field. Allowed fields: " + String.join(", ", allowedFields));
        }
    }
}
