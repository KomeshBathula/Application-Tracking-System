package com.ats.backend.service.ai;

import com.ats.backend.entity.CompanyAiConfig;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OpenAiScreeningProvider implements AiScreeningProvider {

    private static final String DEFAULT_SYSTEM_PROMPT =
            """
            You are an expert technical recruiter and resume analyst. Analyze the following candidate resume against the job description.
            You MUST return ONLY a valid JSON object (no markdown, no explanation outside JSON) with these exact fields:
            {
              "overallScore": <0-100>,
              "experienceScore": <0-100>,
              "educationScore": <0-100>,
              "projectsScore": <0-100>,
              "certificationsScore": <0-100>,
              "strengths": ["strength1", "strength2", ...],
              "weaknesses": ["weakness1", "weakness2", ...],
              "matchedSkills": ["skill1", "skill2", ...],
              "missingSkills": ["skill1", "skill2", ...],
              "recommendation": "HIGHLY_RECOMMENDED" | "RECOMMENDED" | "NEEDS_MANUAL_REVIEW" | "LOW_MATCH"
            }
            Score each dimension based on the job requirements. Be thorough and specific in strengths, weaknesses, and skill analysis.
            """;

    @Override
    public String getProviderName() {
        return "OPENAI";
    }

    @Override
    public String analyzeResume(String resumeContent, String jobDescription, CompanyAiConfig config) {
        if (config.getApiKey() == null || config.getApiKey().trim().isEmpty()) {
            throw new IllegalArgumentException("OpenAI API Key is not configured for the company.");
        }

        OpenAiApi openAiApi = new OpenAiApi(config.getApiKey());

        double temp = config.getTemperature() != null ? config.getTemperature() : 0.2;
        int tokens = config.getMaxTokens() != null ? config.getMaxTokens() : 2000;
        String model = (config.getModelName() != null && !config.getModelName().isEmpty()) ? config.getModelName() : "gpt-4o";

        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .withModel(model)
                .withTemperature((float) temp)
                .withMaxTokens(tokens)
                .build();

        OpenAiChatModel chatModel = new OpenAiChatModel(openAiApi, options);

        String systemPromptText = config.getResumeAnalysisPrompt();
        if (systemPromptText == null || systemPromptText.trim().isEmpty()) {
            systemPromptText = DEFAULT_SYSTEM_PROMPT;
        }

        String userPromptText = String.format(
                "JOB DESCRIPTION:\n%s\n\nCANDIDATE RESUME:\n%s",
                jobDescription,
                resumeContent
        );

        Prompt prompt = new Prompt(List.of(
                new SystemMessage(systemPromptText),
                new UserMessage(userPromptText)
        ));

        return chatModel.call(prompt).getResult().getOutput().getContent();
    }
}
