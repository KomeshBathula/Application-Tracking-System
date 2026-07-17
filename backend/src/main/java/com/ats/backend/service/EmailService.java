package com.ats.backend.service;

public interface EmailService {
    void sendEmail(String to, String fromPersonalName, String replyTo, String subject, String bodyHtml);
    void sendApplicationSubmissionEmail(String candidateEmail, String candidateName, String jobTitle, String recruiterEmail, String recruiterName);
    void sendApplicationStatusUpdatedEmail(String candidateEmail, String candidateName, String jobTitle, String newStatus, String note, String recruiterEmail, String recruiterName);
    void sendApplicationWithdrawnEmail(String candidateEmail, String candidateName, String jobTitle, String recruiterEmail, String recruiterName);
    void sendApplicationWithdrawnByAdminEmail(String candidateEmail, String candidateName, String jobTitle, String recruiterEmail, String recruiterName, String adminName);
}
