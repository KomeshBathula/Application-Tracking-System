package com.ats.backend.service.impl;

import com.ats.backend.dto.AiScreeningResultDto;
import com.ats.backend.entity.*;
import com.ats.backend.exception.InvalidRequestException;
import com.ats.backend.exception.ResourceNotFoundException;
import com.ats.backend.mapper.AiScreeningResultMapper;
import com.ats.backend.repository.*;
import com.ats.backend.service.AiScreeningService;
import com.ats.backend.service.ai.AiProviderRegistry;
import com.ats.backend.service.ai.AiScreeningProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiScreeningServiceImpl implements AiScreeningService {

    private static final Logger log = LoggerFactory.getLogger(AiScreeningServiceImpl.class);

    private final ApplicationRepository applicationRepository;
    private final CompanyAiConfigRepository configRepository;
    private final AiScreeningResultRepository screeningResultRepository;
    private final UserRepository userRepository;
    private final AiProviderRegistry providerRegistry;
    private final AiScreeningResultMapper screeningResultMapper;
    private final ObjectMapper objectMapper;

    public AiScreeningServiceImpl(
            ApplicationRepository applicationRepository,
            CompanyAiConfigRepository configRepository,
            AiScreeningResultRepository screeningResultRepository,
            UserRepository userRepository,
            AiProviderRegistry providerRegistry,
            AiScreeningResultMapper screeningResultMapper,
            ObjectMapper objectMapper) {
        this.applicationRepository = applicationRepository;
        this.configRepository = configRepository;
        this.screeningResultRepository = screeningResultRepository;
        this.userRepository = userRepository;
        this.providerRegistry = providerRegistry;
        this.screeningResultMapper = screeningResultMapper;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public AiScreeningResultDto screenApplication(Long applicationId, String recruiterEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found: " + recruiterEmail));

        // Enforce tenant boundary
        if (recruiter.getCompany() == null || application.getJob().getCompanyEntity() == null ||
                !recruiter.getCompany().getId().equals(application.getJob().getCompanyEntity().getId())) {
            throw new InvalidRequestException("You are not authorized to screen candidates for this company.");
        }

        Company company = recruiter.getCompany();
        CompanyAiConfig config = configRepository.findByCompanyId(company.getId())
                .orElseThrow(() -> new InvalidRequestException("AI screening is not configured for your company. Please configure it in AI Settings first."));

        if (!config.isEnabled()) {
            throw new InvalidRequestException("AI screening is disabled for your company. Please enable it in AI Settings.");
        }

        // Extract resume content
        byte[] resumeBytes = application.getCandidate().getResumeData();
        String contentType = application.getCandidate().getResumeContentType();
        if (resumeBytes == null || resumeBytes.length == 0) {
            throw new InvalidRequestException("Candidate has not uploaded a resume.");
        }

        String resumeText;
        try {
            resumeText = extractText(resumeBytes, contentType);
        } catch (Exception e) {
            log.error("Failed to extract text from resume: ", e);
            throw new InvalidRequestException("Failed to read candidate resume: " + e.getMessage());
        }

        String jobDescription = application.getJob().getDescription();
        AiScreeningProvider provider = providerRegistry.getProvider(config.getAiProvider());

        long startTime = System.currentTimeMillis();
        String rawResponse = provider.analyzeResume(resumeText, jobDescription, config);
        long duration = System.currentTimeMillis() - startTime;
        log.info("AI Analysis completed in {}ms", duration);

        // Parse and save screening result
        AiScreeningResult result = parseResponse(rawResponse, application, config);
        
        // Remove existing result if any (overwrite support)
        screeningResultRepository.findByApplicationId(applicationId)
                .ifPresent(screeningResultRepository::delete);

        AiScreeningResult saved = screeningResultRepository.save(result);
        return screeningResultMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AiScreeningResultDto getScreeningResultByApplicationId(Long applicationId, String requesterEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requesterEmail));

        // Tenant check: Platform admin is exempt. Recruiters and company admins must match company. Candidate must be the owner.
        boolean isAdmin = requester.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        boolean isCandidate = requester.getRole().getRoleName() == RoleName.ROLE_CANDIDATE;

        if (isCandidate) {
            if (!application.getCandidate().getId().equals(requester.getId())) {
                throw new InvalidRequestException("You are not authorized to view this screening result.");
            }
        } else if (!isAdmin) {
            // Must be tenant user
            if (requester.getCompany() == null || application.getJob().getCompanyEntity() == null ||
                    !requester.getCompany().getId().equals(application.getJob().getCompanyEntity().getId())) {
                throw new InvalidRequestException("You are not authorized to view this screening result.");
            }
        }

        AiScreeningResult result = screeningResultRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("AI screening result not found for application ID: " + applicationId));

        return screeningResultMapper.toDto(result);
    }

    private String extractText(byte[] bytes, String contentType) throws IOException {
        if (contentType != null && contentType.toLowerCase().contains("pdf")) {
            try (PDDocument document = PDDocument.load(new ByteArrayInputStream(bytes))) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        }
        // Fallback: treat as plain text
        return new String(bytes, StandardCharsets.UTF_8);
    }

    private AiScreeningResult parseResponse(String rawResponse, Application application, CompanyAiConfig config) {
        String cleanJson = rawResponse.trim();
        if (cleanJson.startsWith("```")) {
            int firstLineBreak = cleanJson.indexOf('\n');
            int lastBackticks = cleanJson.lastIndexOf("```");
            if (firstLineBreak != -1 && lastBackticks != -1 && lastBackticks > firstLineBreak) {
                cleanJson = cleanJson.substring(firstLineBreak, lastBackticks).trim();
            }
        }

        try {
            JsonNode root = objectMapper.readTree(cleanJson);
            
            int overallScore = root.path("overallScore").asInt(50);
            int experienceScore = root.path("experienceScore").asInt(overallScore);
            int educationScore = root.path("educationScore").asInt(overallScore);
            int projectsScore = root.path("projectsScore").asInt(overallScore);
            int certificationsScore = root.path("certificationsScore").asInt(overallScore);

            List<String> strengths = new ArrayList<>();
            root.path("strengths").forEach(node -> strengths.add(node.asText()));
            
            List<String> weaknesses = new ArrayList<>();
            root.path("weaknesses").forEach(node -> weaknesses.add(node.asText()));

            List<String> matchedSkills = new ArrayList<>();
            root.path("matchedSkills").forEach(node -> matchedSkills.add(node.asText()));

            List<String> missingSkills = new ArrayList<>();
            root.path("missingSkills").forEach(node -> missingSkills.add(node.asText()));

            String recommendationStr = root.path("recommendation").asText("NEEDS_MANUAL_REVIEW").toUpperCase();
            AiRecommendation recommendation;
            try {
                recommendation = AiRecommendation.valueOf(recommendationStr);
            } catch (IllegalArgumentException e) {
                recommendation = AiRecommendation.NEEDS_MANUAL_REVIEW;
            }

            int completionTokens = rawResponse.length() / 4;
            int promptTokens = 1500;

            return AiScreeningResult.builder()
                    .application(application)
                    .overallScore(overallScore)
                    .experienceScore(experienceScore)
                    .educationScore(educationScore)
                    .projectsScore(projectsScore)
                    .certificationsScore(certificationsScore)
                    .strengths(strengths)
                    .weaknesses(weaknesses)
                    .matchedSkills(matchedSkills)
                    .missingSkills(missingSkills)
                    .recommendation(recommendation)
                    .rawJsonResponse(rawResponse)
                    .modelName(config.getModelName())
                    .promptVersion("1.0")
                    .promptTokens(promptTokens)
                    .completionTokens(completionTokens)
                    .totalTokens(promptTokens + completionTokens)
                    .costEstimation(0.0)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse AI response as JSON: {}. Fallback to manual review scoring.", cleanJson, e);
            return AiScreeningResult.builder()
                    .application(application)
                    .overallScore(50)
                    .recommendation(AiRecommendation.NEEDS_MANUAL_REVIEW)
                    .rawJsonResponse(rawResponse)
                    .modelName(config.getModelName())
                    .promptVersion("1.0")
                    .strengths(List.of("Could not parse AI response cleanly. Please check raw response."))
                    .weaknesses(List.of("Parsing failure."))
                    .build();
        }
    }
}
