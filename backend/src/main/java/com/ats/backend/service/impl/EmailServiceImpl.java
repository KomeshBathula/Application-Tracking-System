package com.ats.backend.service.impl;

import com.ats.backend.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${ats.mail.from-email:noreply@ats-recruiter.com}")
    private String fromEmail;

    @Value("${ats.mail.use-recruiter-as-from:false}")
    private boolean useRecruiterAsFrom;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    @Async
    public void sendEmail(String to, String fromPersonalName, String replyTo, String subject, String bodyHtml) {
        log.info("Sending email to: {} (Reply-To: {}, FromPersonal: {})", to, replyTo, fromPersonalName);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // If the SMTP server allows sending from arbitrary email addresses:
            if (useRecruiterAsFrom && replyTo != null && !replyTo.trim().isEmpty()) {
                helper.setFrom(replyTo, fromPersonalName);
            } else {
                // Enterprise best practice: Use verified system email as 'From' with recruiter display name, 
                // and route replies directly to the recruiter's email.
                if (fromPersonalName != null && !fromPersonalName.trim().isEmpty()) {
                    helper.setFrom(fromEmail, fromPersonalName);
                } else {
                    helper.setFrom(fromEmail, "ATS Recruitment Team");
                }
                if (replyTo != null && !replyTo.trim().isEmpty()) {
                    helper.setReplyTo(replyTo);
                }
            }
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(bodyHtml, true);
            
            mailSender.send(message);
            log.info("Successfully sent email to: {} with subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}. Error: {}", to, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendApplicationSubmissionEmail(String candidateEmail, String candidateName, String jobTitle, String recruiterEmail, String recruiterName) {
        candidateName = HtmlUtils.htmlEscape(candidateName);
        jobTitle = HtmlUtils.htmlEscape(jobTitle);
        recruiterName = HtmlUtils.htmlEscape(recruiterName);
        recruiterEmail = HtmlUtils.htmlEscape(recruiterEmail);
        String subject = "Application Received: " + jobTitle + " at ATS Corporation";
        String body = String.format(
            "<html>" +
            "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e1da; border-radius: 8px;'>" +
            "  <div style='background-color: #0f6e5e; color: white; padding: 15px 20px; border-radius: 6px 6px 0 0; text-align: center;'>" +
            "    <h2 style='margin: 0; font-weight: 600;'>ATS Corporation</h2>" +
            "  </div>" +
            "  <div style='padding: 20px;'>" +
            "    <p>Hi <strong>%s</strong>,</p>" +
            "    <p>Thank you for applying for the <strong>%s</strong> position. We have received your application and our recruitment team will review it shortly.</p>" +
            "    <p>You can track your application status and history anytime by logging into the Candidate Dashboard.</p>" +
            "    <br/>" +
            "    <p>Best regards,<br/><strong>%s</strong><br/>Recruitment at ATS Corporation</p>" +
            "  </div>" +
            "  <div style='border-top: 1px solid #e4e1da; padding: 15px; font-size: 0.8rem; color: #8a94a0; text-align: center;'>" +
            "    This is an automated notification. Replies will be routed directly to %s." +
            "  </div>" +
            "</body>" +
            "</html>",
            candidateName, jobTitle, recruiterName, recruiterEmail
        );
        sendEmail(candidateEmail, recruiterName + " via ATS", recruiterEmail, subject, body);
    }

    @Override
    @Async
    public void sendApplicationStatusUpdatedEmail(String candidateEmail, String candidateName, String jobTitle, String newStatus, String note, String recruiterEmail, String recruiterName) {
        candidateName = HtmlUtils.htmlEscape(candidateName);
        jobTitle = HtmlUtils.htmlEscape(jobTitle);
        recruiterName = HtmlUtils.htmlEscape(recruiterName);
        recruiterEmail = HtmlUtils.htmlEscape(recruiterEmail);
        String escapedNote = note != null ? HtmlUtils.htmlEscape(note) : null;
        String noteSection = (escapedNote != null && !escapedNote.trim().isEmpty()) 
            ? String.format("<div style='background-color: #f7f6f3; padding: 15px; border-left: 4px solid #0f6e5e; margin: 15px 0; border-radius: 0 6px 6px 0;'><strong>Recruiter's Note:</strong><br/>%s</div>", escapedNote) 
            : "";

        String statusText = newStatus.replace('_', ' ');
        String statusMessage = "";
        String badgeBgColor = "#e6f4ea";
        String badgeTextColor = "#137333";
        String badgeBorderColor = "#ceead6";
        String headerBgColor = "#0f6e5e";

        switch (newStatus) {
            case "UNDER_REVIEW":
                statusMessage = "Your application is currently under review by our hiring team. We are carefully evaluating your qualifications and experience relative to the requirements of the position.";
                badgeBgColor = "#fffbeb";
                badgeTextColor = "#b45309";
                badgeBorderColor = "#fde68a";
                break;
            case "SHORTLISTED":
                statusMessage = "Congratulations! Your profile has been shortlisted for this position. Our hiring team was impressed by your background and would like to proceed with your candidacy.";
                badgeBgColor = "#eff6ff";
                badgeTextColor = "#1d4ed8";
                badgeBorderColor = "#bfdbfe";
                break;
            case "INTERVIEW_SCHEDULED":
                statusMessage = "An interview has been scheduled for your application. We look forward to discussing how your skills align with this opportunity. Please check your dashboard for scheduling details.";
                badgeBgColor = "#fdf2f8";
                badgeTextColor = "#be185d";
                badgeBorderColor = "#fbcfe8";
                break;
            case "INTERVIEWED":
                statusMessage = "Thank you for taking the time to interview with our team. We are currently consolidating feedback from all interviewers and will be in touch with you shortly regarding the next steps.";
                badgeBgColor = "#f5f3ff";
                badgeTextColor = "#6d28d9";
                badgeBorderColor = "#ddd6fe";
                break;
            case "OFFERED":
                statusMessage = "We are thrilled to extend an official offer of employment to you for this position! Our recruitment team will contact you shortly with the details of the offer package.";
                badgeBgColor = "#d1fae5";
                badgeTextColor = "#065f46";
                badgeBorderColor = "#a7f3d0";
                break;
            case "REJECTED":
                statusMessage = "Unfortunately, after careful consideration, we have decided not to move forward with your application at this time. We received many applications from highly qualified candidates, and this decision does not reflect your capabilities. We appreciate your interest in our company and wish you the best in your job search.";
                badgeBgColor = "#fee2e2";
                badgeTextColor = "#991b1b";
                badgeBorderColor = "#fca5a5";
                headerBgColor = "#c55b4e";
                break;
            case "WITHDRAWN":
                statusMessage = "This email confirms that you have successfully withdrawn your application. We appreciate your interest in our company and hope to connect again in the future.";
                badgeBgColor = "#f3f4f6";
                badgeTextColor = "#374151";
                badgeBorderColor = "#e5e7eb";
                headerBgColor = "#4b5563";
                break;
            case "APPLIED":
            default:
                statusMessage = "Your application has been received and is currently in our system. Our team will review your application materials and provide updates as the process moves forward.";
                badgeBgColor = "#e6f4ea";
                badgeTextColor = "#137333";
                badgeBorderColor = "#ceead6";
                break;
        }

        String subject = "Application Status Update: " + jobTitle;
        String body = String.format(
            "<html>" +
            "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e1da; border-radius: 8px;'>" +
            "  <div style='background-color: %s; color: white; padding: 15px 20px; border-radius: 6px 6px 0 0; text-align: center;'>" +
            "    <h2 style='margin: 0; font-weight: 600;'>ATS Corporation</h2>" +
            "  </div>" +
            "  <div style='padding: 20px;'>" +
            "    <p>Hi <strong>%s</strong>,</p>" +
            "    <p>The status of your application for the <strong>%s</strong> position has been updated to:</p>" +
            "    <div style='text-align: center; margin: 20px 0;'>" +
            "      <span style='background-color: %s; color: %s; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 1rem; border: 1px solid %s; text-transform: uppercase;'>%s</span>" +
            "    </div>" +
            "    <p style='color: #4a4a4a; font-size: 0.95rem; margin-bottom: 20px;'>%s</p>" +
            "    %s" +
            "    <p>Please log in to your Candidate Portal to review the details or prepare for any next steps.</p>" +
            "    <br/>" +
            "    <p>Best regards,<br/><strong>%s</strong><br/>Recruitment at ATS Corporation</p>" +
            "  </div>" +
            "  <div style='border-top: 1px solid #e4e1da; padding: 15px; font-size: 0.8rem; color: #8a94a0; text-align: center;'>" +
            "    This is an automated notification. Replies will be routed directly to %s." +
            "  </div>" +
            "</body>" +
            "</html>",
            headerBgColor, candidateName, jobTitle, badgeBgColor, badgeTextColor, badgeBorderColor, statusText, statusMessage, noteSection, recruiterName, recruiterEmail
        );
        sendEmail(candidateEmail, recruiterName + " via ATS", recruiterEmail, subject, body);
    }

    @Override
    @Async
    public void sendApplicationWithdrawnEmail(String candidateEmail, String candidateName, String jobTitle, String recruiterEmail, String recruiterName) {
        candidateName = HtmlUtils.htmlEscape(candidateName);
        jobTitle = HtmlUtils.htmlEscape(jobTitle);
        recruiterName = HtmlUtils.htmlEscape(recruiterName);
        recruiterEmail = HtmlUtils.htmlEscape(recruiterEmail);
        String subject = "Application Withdrawn: " + jobTitle;
        String body = String.format(
            "<html>" +
            "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e1da; border-radius: 8px;'>" +
            "  <div style='background-color: #c55b4e; color: white; padding: 15px 20px; border-radius: 6px 6px 0 0; text-align: center;'>" +
            "    <h2 style='margin: 0; font-weight: 600;'>ATS Corporation</h2>" +
            "  </div>" +
            "  <div style='padding: 20px;'>" +
            "    <p>Hi <strong>%s</strong>,</p>" +
            "    <p>This email confirms that you have successfully withdrawn your application for the <strong>%s</strong> position.</p>" +
            "    <p>We are sorry to see you go! If this was done in error or you change your mind, you can re-apply if the posting is still open.</p>" +
            "    <br/>" +
            "    <p>Best regards,<br/><strong>%s</strong><br/>Recruitment at ATS Corporation</p>" +
            "  </div>" +
            "  <div style='border-top: 1px solid #e4e1da; padding: 15px; font-size: 0.8rem; color: #8a94a0; text-align: center;'>" +
            "    This is an automated notification. Replies will be routed directly to %s." +
            "  </div>" +
            "</body>" +
            "</html>",
            candidateName, jobTitle, recruiterName, recruiterEmail
        );
        sendEmail(candidateEmail, recruiterName + " via ATS", recruiterEmail, subject, body);
    }

    @Override
    @Async
    public void sendApplicationWithdrawnByAdminEmail(String candidateEmail, String candidateName, String jobTitle, String recruiterEmail, String recruiterName, String adminName) {
        candidateName = HtmlUtils.htmlEscape(candidateName);
        jobTitle = HtmlUtils.htmlEscape(jobTitle);
        recruiterName = HtmlUtils.htmlEscape(recruiterName);
        recruiterEmail = HtmlUtils.htmlEscape(recruiterEmail);
        adminName = HtmlUtils.htmlEscape(adminName);
        String subject = "Application Withdrawn by Administrator: " + jobTitle;
        String body = String.format(
            "<html>" +
            "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e1da; border-radius: 8px;'>" +
            "  <div style='background-color: #c55b4e; color: white; padding: 15px 20px; border-radius: 6px 6px 0 0; text-align: center;'>" +
            "    <h2 style='margin: 0; font-weight: 600;'>ATS Corporation</h2>" +
            "  </div>" +
            "  <div style='padding: 20px;'>" +
            "    <p>Hi <strong>%s</strong>,</p>" +
            "    <p>This email is to notify you that your application for the <strong>%s</strong> position has been withdrawn by administrator <strong>%s</strong>.</p>" +
            "    <p>If you have any questions or believe this was done in error, please contact recruitment support.</p>" +
            "    <br/>" +
            "    <p>Best regards,<br/><strong>%s</strong><br/>Recruitment at ATS Corporation</p>" +
            "  </div>" +
            "  <div style='border-top: 1px solid #e4e1da; padding: 15px; font-size: 0.8rem; color: #8a94a0; text-align: center;'>" +
            "    This is an automated notification. Replies will be routed directly to %s." +
            "  </div>" +
            "</body>" +
            "</html>",
            candidateName, jobTitle, adminName, recruiterName, recruiterEmail
        );
        sendEmail(candidateEmail, recruiterName + " via ATS", recruiterEmail, subject, body);
    }
}
