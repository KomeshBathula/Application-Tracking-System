package com.ats.backend.mapper;

import com.ats.backend.dto.ApplicationDto;
import com.ats.backend.dto.ApplicationStatusHistoryDto;
import com.ats.backend.entity.Application;
import com.ats.backend.entity.ApplicationStatusHistory;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMapper {

    private final com.ats.backend.repository.AiScreeningResultRepository aiScreeningResultRepository;

    public ApplicationMapper(com.ats.backend.repository.AiScreeningResultRepository aiScreeningResultRepository) {
        this.aiScreeningResultRepository = aiScreeningResultRepository;
    }

    public ApplicationDto toDto(Application application) {
        if (application == null) {
            return null;
        }

        java.util.Optional<com.ats.backend.entity.AiScreeningResult> screeningResultOpt = 
                aiScreeningResultRepository.findByApplicationId(application.getId());

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
                .aiRecommendation(screeningResultOpt.map(r -> r.getRecommendation().name()).orElse(null))
                .aiOverallScore(screeningResultOpt.map(com.ats.backend.entity.AiScreeningResult::getOverallScore).orElse(null))
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
