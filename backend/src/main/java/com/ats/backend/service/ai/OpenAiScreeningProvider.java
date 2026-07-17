package com.ats.backend.service.ai;

import com.ats.backend.entity.CompanyAiConfig;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.stereotype.Service;

@Service
public class OpenAiScreeningProvider implements AiScreeningProvider {

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
        
        String systemPrompt = config.getResumeAnalysisPrompt();
        if (systemPrompt == null || systemPrompt.trim().isEmpty()) {
            systemPrompt = "You are an expert technical recruiter. Analyze the following candidate resume against the job description. " +
                    "Return a JSON response with the candidate's scores (overall, experience, education, projects, certifications), " +
                    "strengths, weaknesses, matched skills, missing skills, recommendation, confidence score, and a summary.";
        }

        String userPrompt = String.format(
                "JOB DESCRIPTION:\n%s\n\nCANDIDATE RESUME:\n%s\n",
                jobDescription,
                resumeContent
        );

        String fullPrompt = systemPrompt + "\n\n" + userPrompt;
        
        return chatModel.call(fullPrompt);
    }
}
