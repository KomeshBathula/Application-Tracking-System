package com.ats.backend.service.impl;

import com.ats.backend.dto.CompanyAiConfigDto;
import com.ats.backend.entity.Company;
import com.ats.backend.entity.CompanyAiConfig;
import com.ats.backend.entity.RoleName;
import com.ats.backend.entity.User;
import com.ats.backend.exception.InvalidRequestException;
import com.ats.backend.exception.ResourceNotFoundException;
import com.ats.backend.mapper.CompanyAiConfigMapper;
import com.ats.backend.repository.CompanyAiConfigRepository;
import com.ats.backend.repository.UserRepository;
import com.ats.backend.service.CompanyAiConfigService;
import com.ats.backend.service.ai.AiProviderRegistry;
import com.ats.backend.service.ai.AiScreeningProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompanyAiConfigServiceImpl implements CompanyAiConfigService {

    private final CompanyAiConfigRepository configRepository;
    private final UserRepository userRepository;
    private final CompanyAiConfigMapper configMapper;
    private final AiProviderRegistry providerRegistry;

    public CompanyAiConfigServiceImpl(
            CompanyAiConfigRepository configRepository,
            UserRepository userRepository,
            CompanyAiConfigMapper configMapper,
            AiProviderRegistry providerRegistry) {
        this.configRepository = configRepository;
        this.userRepository = userRepository;
        this.configMapper = configMapper;
        this.providerRegistry = providerRegistry;
    }

    @Override
    @Transactional
    public CompanyAiConfigDto saveConfig(CompanyAiConfigDto dto, String requesterEmail) {
        User user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requesterEmail));

        boolean isCompanyAdmin = user.getRole().getRoleName() == RoleName.ROLE_COMPANY_ADMIN;
        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        if (!isCompanyAdmin && !isAdmin) {
            throw new InvalidRequestException("Only company administrators or platform administrators can modify AI configuration.");
        }

        Company company = user.getCompany();
        if (company == null) {
            throw new InvalidRequestException("User is not associated with a company.");
        }

        CompanyAiConfig config = configRepository.findByCompanyId(company.getId())
                .orElseGet(() -> CompanyAiConfig.builder().company(company).build());

        config.setAiProvider(dto.getAiProvider());
        config.setModelName(dto.getModelName());
        config.setResumeAnalysisPrompt(dto.getResumeAnalysisPrompt());
        config.setTemperature(dto.getTemperature());
        config.setMaxTokens(dto.getMaxTokens());
        config.setEnabled(dto.isEnabled());

        if (dto.getApiKey() != null && !dto.getApiKey().isEmpty() && !dto.getApiKey().contains("•••")) {
            config.setApiKey(dto.getApiKey().trim());
        } else if (config.getApiKey() == null || config.getApiKey().isEmpty()) {
            throw new IllegalArgumentException("API Key is required.");
        }

        CompanyAiConfig saved = configRepository.save(config);
        return configMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyAiConfigDto getMyCompanyConfig(String requesterEmail) {
        User user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requesterEmail));

        Company company = user.getCompany();
        if (company == null) {
            throw new InvalidRequestException("User is not associated with a company.");
        }

        CompanyAiConfig config = configRepository.findByCompanyId(company.getId())
                .orElseGet(() -> CompanyAiConfig.builder()
                        .company(company)
                        .aiProvider("OPENAI")
                        .modelName("gpt-4o")
                        .temperature(0.2)
                        .maxTokens(2000)
                        .enabled(false)
                        .build());

        return configMapper.toDto(config);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean testConfig(String requesterEmail) {
        User user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requesterEmail));

        Company company = user.getCompany();
        if (company == null) {
            throw new InvalidRequestException("User is not associated with a company.");
        }

        CompanyAiConfig config = configRepository.findByCompanyId(company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("AI Config not found for company: " + company.getName()));

        try {
            AiScreeningProvider provider = providerRegistry.getProvider(config.getAiProvider());
            String result = provider.analyzeResume("Hello, test resume.", "Test job description.", config);
            return result != null && !result.isEmpty();
        } catch (Exception e) {
            throw new InvalidRequestException("AI configuration test failed: " + e.getMessage());
        }
    }
}
