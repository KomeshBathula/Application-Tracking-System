package com.ats.backend.service.ai;

import com.ats.backend.entity.CompanyAiConfig;

public interface AiScreeningProvider {
    String getProviderName(); // e.g. "OPENAI", "GEMINI", etc.
    String analyzeResume(String resumeContent, String jobDescription, CompanyAiConfig config);
}
