package com.ats.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyAiConfigDto {
    private Long id;
    private Long companyId;
    private String companyName;
    private String aiProvider;
    private String apiKey; // Masked on read
    private String modelName;
    private String resumeAnalysisPrompt;
    private Double temperature;
    private Integer maxTokens;
    private boolean enabled;
    private boolean apiKeyConfigured; // Helper field to indicate key exists without sending it
}
