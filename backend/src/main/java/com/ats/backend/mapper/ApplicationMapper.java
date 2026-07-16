package com.ats.backend.mapper;

import com.ats.backend.dto.ApplicationDto;
import com.ats.backend.dto.ApplicationStatusHistoryDto;
import com.ats.backend.entity.Application;
import com.ats.backend.entity.ApplicationStatusHistory;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMapper {

    public ApplicationDto toDto(Application application) {
        if (application == null) {
            return null;
        }
        return ApplicationDto.builder()
                .id(application.getId())
                .jobId(application.getJob().getId())
                .jobTitle(application.getJob().getTitle())
                .company(application.getJob().getCompany())
                .location(application.getJob().getLocation())
                .candidateId(application.getCandidate().getId())
                .candidateFullName(application.getCandidate().getFullName())
                .candidateEmail(application.getCandidate().getEmail())
                .resumeUrl(application.getResumeUrl())
                .status(application.getStatus())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }

    public ApplicationStatusHistoryDto toDto(ApplicationStatusHistory history) {
        if (history == null) {
            return null;
        }
        return ApplicationStatusHistoryDto.builder()
                .id(history.getId())
                .applicationId(history.getApplication().getId())
                .previousStatus(history.getPreviousStatus())
                .newStatus(history.getNewStatus())
                .changedById(history.getChangedBy().getId())
                .changedByName(history.getChangedBy().getFullName())
                .changedByEmail(history.getChangedBy().getEmail())
                .note(history.getNote())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
