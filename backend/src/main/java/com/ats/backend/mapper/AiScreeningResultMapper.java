package com.ats.backend.mapper;

import com.ats.backend.dto.AiScreeningResultDto;
import com.ats.backend.entity.AiScreeningResult;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class AiScreeningResultMapper {

    public AiScreeningResultDto toDto(AiScreeningResult entity) {
        if (entity == null) {
            return null;
        }
        return AiScreeningResultDto.builder()
                .id(entity.getId())
                .applicationId(entity.getApplication().getId())
                .jobId(entity.getApplication().getJob().getId())
                .jobTitle(entity.getApplication().getJob().getTitle())
                .candidateName(entity.getApplication().getCandidate().getFullName())
                .overallScore(entity.getOverallScore())
                .experienceScore(entity.getExperienceScore())
                .educationScore(entity.getEducationScore())
                .projectsScore(entity.getProjectsScore())
                .certificationsScore(entity.getCertificationsScore())
                .strengths(entity.getStrengths() != null ? new ArrayList<>(entity.getStrengths()) : new ArrayList<>())
                .weaknesses(entity.getWeaknesses() != null ? new ArrayList<>(entity.getWeaknesses()) : new ArrayList<>())
                .matchedSkills(entity.getMatchedSkills() != null ? new ArrayList<>(entity.getMatchedSkills()) : new ArrayList<>())
                .missingSkills(entity.getMissingSkills() != null ? new ArrayList<>(entity.getMissingSkills()) : new ArrayList<>())
                .recommendation(entity.getRecommendation())
                .rawJsonResponse(entity.getRawJsonResponse())
                .promptVersion(entity.getPromptVersion())
                .modelName(entity.getModelName())
                .promptTokens(entity.getPromptTokens())
                .completionTokens(entity.getCompletionTokens())
                .totalTokens(entity.getTotalTokens())
                .costEstimation(entity.getCostEstimation())
                .screenedAt(entity.getScreenedAt())
                .build();
    }
}
