package com.ats.backend.service;

import com.ats.backend.dto.AiScreeningResultDto;

public interface AiScreeningService {
    AiScreeningResultDto screenApplication(Long applicationId, String recruiterEmail);
    AiScreeningResultDto getScreeningResultByApplicationId(Long applicationId, String requesterEmail);
}
