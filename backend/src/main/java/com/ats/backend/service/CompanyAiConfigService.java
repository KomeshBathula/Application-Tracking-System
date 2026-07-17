package com.ats.backend.service;

import com.ats.backend.dto.CompanyAiConfigDto;

public interface CompanyAiConfigService {
    CompanyAiConfigDto saveConfig(CompanyAiConfigDto dto, String requesterEmail);
    CompanyAiConfigDto getMyCompanyConfig(String requesterEmail);
    boolean testConfig(String requesterEmail);
}
