package com.ats.backend.service.ai;

import com.ats.backend.entity.CompanyAiConfig;
import org.springframework.stereotype.Service;

@Service
public class GroqScreeningProvider implements AiScreeningProvider {

    @Override
    public String getProviderName() {
        return "GROQ";
    }

    @Override
    public String analyzeResume(String resumeText, String jobDescription, CompanyAiConfig config) {
        return """
        {
          "overallScore": 88,
          "experienceScore": 90,
          "educationScore": 85,
          "projectsScore": 88,
          "certificationsScore": 80,
          "strengths": ["High inference performance", "Relevant tech stack experience", "Solid backend architecture background"],
          "weaknesses": ["Minor gap in legacy framework tools"],
          "matchedSkills": ["Java", "Spring Boot", "React", "MySQL"],
          "missingSkills": ["Kubernetes"],
          "recommendation": "RECOMMENDED"
        }
        """;
    }
}
