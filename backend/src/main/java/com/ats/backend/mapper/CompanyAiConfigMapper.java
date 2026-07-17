package com.ats.backend.mapper;

import com.ats.backend.dto.CompanyAiConfigDto;
import com.ats.backend.entity.CompanyAiConfig;
import org.springframework.stereotype.Component;

@Component
public class CompanyAiConfigMapper {

    public CompanyAiConfigDto toDto(CompanyAiConfig config) {
        if (config == null) {
            return null;
        }
        return CompanyAiConfigDto.builder()
                .id(config.getId())
                .companyId(config.getCompany().getId())
                .companyName(config.getCompany().getName())
                .aiProvider(config.getAiProvider())
                .apiKey(config.getApiKey() != null && !config.getApiKey().isEmpty() ? "••••••••••••••••" : null)
                .modelName(config.getModelName())
                .resumeAnalysisPrompt(config.getResumeAnalysisPrompt())
                .temperature(config.getTemperature())
                .maxTokens(config.getMaxTokens())
                .enabled(config.isEnabled())
                .apiKeyConfigured(config.getApiKey() != null && !config.getApiKey().isEmpty())
                .build();
    }
}
