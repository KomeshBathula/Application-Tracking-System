package com.ats.backend.service;

import com.ats.backend.dto.ApplicationDto;
import com.ats.backend.dto.ApplicationStatusHistoryDto;
import com.ats.backend.entity.ApplicationStatus;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ApplicationService {

    ApplicationDto applyToJob(Long jobId, String candidateEmail);

    void withdrawApplication(Long applicationId, String candidateEmail);

    ApplicationDto updateApplicationStatus(Long applicationId, ApplicationStatus newStatus, String note, String userEmail);

    List<ApplicationStatusHistoryDto> getApplicationTimeline(Long applicationId, String userEmail);

    Page<ApplicationDto> getCandidateApplications(String candidateEmail, String status, String search, int page, int size, String sortBy, String sortDir);

    Page<ApplicationDto> getJobApplications(Long jobId, String recruiterEmail, String status, String search, int page, int size, String sortBy, String sortDir);
}
