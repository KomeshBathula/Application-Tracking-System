package com.ats.backend.service.ai;

import com.ats.backend.entity.CompanyAiConfig;
import org.springframework.stereotype.Service;

@Service
public class ClaudeScreeningProvider implements AiScreeningProvider {

    @Override
    public String getProviderName() {
        return "CLAUDE";
    }

    @Override
    public String analyzeResume(String resumeText, String jobDescription, CompanyAiConfig config) {
        return """
        {
          "overallScore": 92,
          "experienceScore": 95,
          "educationScore": 90,
          "projectsScore": 92,
          "certificationsScore": 88,
          "strengths": ["Deep technical reasoning", "Strong candidate project history", "Excellent problem solving ability"],
          "weaknesses": ["Requires quick onboarding on internal domain tooling"],
          "matchedSkills": ["Java", "Spring Boot", "REST APIs", "Microservices"],
          "missingSkills": ["AWS Lambda"],
          "recommendation": "HIGHLY_RECOMMENDED"
        }
        """;
    }
}
