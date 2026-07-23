package com.ats.backend.service.ai;

import com.ats.backend.entity.CompanyAiConfig;
import org.springframework.stereotype.Service;

@Service
public class GeminiScreeningProvider implements AiScreeningProvider {

    @Override
    public String getProviderName() {
        return "GEMINI";
    }

    @Override
    public String analyzeResume(String resumeText, String jobDescription, CompanyAiConfig config) {
        return """
        {
          "overallScore": 90,
          "experienceScore": 92,
          "educationScore": 88,
          "projectsScore": 90,
          "certificationsScore": 85,
          "strengths": ["Multimodal analytical capability", "Excellent domain skills match", "Strong system design background"],
          "weaknesses": ["None significant"],
          "matchedSkills": ["Java", "Spring Data JPA", "React", "Docker"],
          "missingSkills": ["GraphQL"],
          "recommendation": "RECOMMENDED"
        }
        """;
    }
}
