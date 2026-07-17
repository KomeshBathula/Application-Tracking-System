package com.ats.backend.dto;

import com.ats.backend.entity.AiRecommendation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiScreeningResultDto {
    private Long id;
    private Long applicationId;
    private Long jobId;
    private String jobTitle;
    private String candidateName;
    private Integer overallScore;
    private Integer experienceScore;
    private Integer educationScore;
    private Integer projectsScore;
    private Integer certificationsScore;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private AiRecommendation recommendation;
    private String rawJsonResponse;
    private String promptVersion;
    private String modelName;
    private Integer promptTokens;
    private Integer completionTokens;
    private Integer totalTokens;
    private Double costEstimation;
    private LocalDateTime screenedAt;
}
