package com.ats.backend.event;

import com.ats.backend.entity.Application;
import com.ats.backend.entity.Job;
import com.ats.backend.entity.NotificationType;
import com.ats.backend.entity.User;
import com.ats.backend.service.EmailService;
import com.ats.backend.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class ApplicationPipelineEventListener {

    private final NotificationService notificationService;
    private final EmailService emailService;

    public ApplicationPipelineEventListener(NotificationService notificationService, EmailService emailService) {
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @EventListener
    public void handleApplicationPipelineEvent(ApplicationPipelineEvent event) {
        try {
            Application application = event.getApplication();
        Job job = application.getJob();
        User candidate = application.getCandidate();
        User recruiter = job.getRecruiter();

        switch (event.getActionType()) {
            case SUBMITTED:
                // Create In-App Notification for Recruiter
                notificationService.createNotification(
                        recruiter,
                        "New Job Application",
                        String.format("Candidate %s has applied for your job: %s.", candidate.getFullName(), job.getTitle()),
                        NotificationType.APPLICATION_SUBMITTED,
                        application.getId(),
                        "/recruiter/dashboard"
                );
                // Send Email Notification to Candidate on behalf of the Recruiter
                emailService.sendApplicationSubmissionEmail(
                        candidate.getEmail(),
                        candidate.getFullName(),
                        job.getTitle(),
                        recruiter.getEmail(),
                        recruiter.getFullName()
                );
                break;

            case STATUS_UPDATED:
                // Create In-App Notification for Candidate
                notificationService.createNotification(
                        candidate,
                        "Application Status Updated",
                        String.format("Your application status for %s has been updated to %s.", job.getTitle(), event.getNewStatus().name().replace('_', ' ')),
                        NotificationType.APPLICATION_STATUS_UPDATED,
                        application.getId(),
                        "/candidate/dashboard"
                );
                // Send Email Notification to Candidate on behalf of the Recruiter
                emailService.sendApplicationStatusUpdatedEmail(
                        candidate.getEmail(),
                        candidate.getFullName(),
                        job.getTitle(),
                        event.getNewStatus().name(),
                        event.getNote(),
                        recruiter.getEmail(),
                        recruiter.getFullName()
                );
                break;

            case WITHDRAWN:
                boolean isWithdrawnByAdmin = event.getActor() != null && !event.getActor().getId().equals(candidate.getId());
                String recruiterMessage = isWithdrawnByAdmin 
                        ? String.format("Application for %s has been withdrawn by administrator %s.", job.getTitle(), event.getActor().getFullName())
                        : String.format("Candidate %s has withdrawn their application for %s.", candidate.getFullName(), job.getTitle());

                // Create In-App Notification for Recruiter
                notificationService.createNotification(
                        recruiter,
                        "Application Withdrawn",
                        recruiterMessage,
                        NotificationType.APPLICATION_STATUS_UPDATED,
                        application.getId(),
                        "/recruiter/dashboard"
                );

                // Send Email Notification to Candidate on behalf of the Recruiter
                if (isWithdrawnByAdmin) {
                    emailService.sendApplicationWithdrawnByAdminEmail(
                            candidate.getEmail(),
                            candidate.getFullName(),
                            job.getTitle(),
                            recruiter.getEmail(),
                            recruiter.getFullName(),
                            event.getActor().getFullName()
                    );
                } else {
                    emailService.sendApplicationWithdrawnEmail(
                            candidate.getEmail(),
                            candidate.getFullName(),
                            job.getTitle(),
                            recruiter.getEmail(),
                            recruiter.getFullName()
                    );
                }
                break;
        }
        } catch (Exception e) {
            log.error("Failed to handle application pipeline event", e);
        }
    }
}
