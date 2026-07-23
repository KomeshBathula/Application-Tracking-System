package com.ats.backend.service.ai;

import com.ats.backend.entity.CompanyAiConfig;
import org.springframework.stereotype.Service;

@Service
public class DeepSeekScreeningProvider implements AiScreeningProvider {

    @Override
    public String getProviderName() {
        return "DEEPSEEK";
    }

    @Override
    public String analyzeResume(String resumeText, String jobDescription, CompanyAiConfig config) {
        return """
        {
          "overallScore": 87,
          "experienceScore": 89,
          "educationScore": 85,
          "projectsScore": 87,
          "certificationsScore": 82,
          "strengths": ["Comprehensive skill match", "Strong code & architectural profile"],
          "weaknesses": ["Limited documentation detailing team management"],
          "matchedSkills": ["Java", "SQL", "Git", "REST APIs"],
          "missingSkills": ["Redis"],
          "recommendation": "RECOMMENDED"
        }
        """;
    }
}
