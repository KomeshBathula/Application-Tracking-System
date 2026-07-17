package com.ats.backend.controller;

import com.ats.backend.dto.ApiResponse;
import com.ats.backend.dto.CompanyAiConfigDto;
import com.ats.backend.service.CompanyAiConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/company-admin/ai-config")
@Tag(name = "Company AI Configuration", description = "Endpoints for managing tenant-specific AI providers and parameters")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ROLE_COMPANY_ADMIN', 'ROLE_ADMIN')")
public class CompanyAiConfigController {

    private final CompanyAiConfigService configService;

    public CompanyAiConfigController(CompanyAiConfigService configService) {
        this.configService = configService;
    }

    @GetMapping
    @Operation(summary = "Get company AI configuration", description = "Restricted to Company Administrator or Platform Administrator.")
    public ResponseEntity<ApiResponse<CompanyAiConfigDto>> getConfig(Principal principal) {
        CompanyAiConfigDto config = configService.getMyCompanyConfig(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("AI Configuration retrieved successfully", config));
    }

    @PostMapping
    @Operation(summary = "Save or update company AI configuration", description = "Restricted to Company Administrator or Platform Administrator.")
    public ResponseEntity<ApiResponse<CompanyAiConfigDto>> saveConfig(@Valid @RequestBody CompanyAiConfigDto dto, Principal principal) {
        CompanyAiConfigDto updated = configService.saveConfig(dto, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("AI Configuration saved successfully", updated));
    }

    @PostMapping("/test")
    @Operation(summary = "Test AI provider connectivity", description = "Validates the current configuration by attempting to connect to the configured AI provider.")
    public ResponseEntity<ApiResponse<Boolean>> testConfig(Principal principal) {
        boolean success = configService.testConfig(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("AI configuration test completed successfully", success));
    }
}
