package com.ats.backend.controller;

import com.ats.backend.dto.ApiResponse;
import com.ats.backend.dto.AiScreeningResultDto;
import com.ats.backend.service.AiScreeningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/screening")
@Tag(name = "AI Screening", description = "Endpoints for AI-powered candidate resume screening and analysis")
@SecurityRequirement(name = "bearerAuth")
public class AiScreeningController {

    private final AiScreeningService screeningService;

    public AiScreeningController(AiScreeningService screeningService) {
        this.screeningService = screeningService;
    }

    @PostMapping("/{applicationId}")
    @PreAuthorize("hasAnyRole('ROLE_RECRUITER', 'ROLE_COMPANY_ADMIN', 'ROLE_ADMIN')")
    @Operation(summary = "Perform AI resume screening for an application", description = "Triggers the AI screening workflow using the tenant's configured AI provider.")
    public ResponseEntity<ApiResponse<AiScreeningResultDto>> screenApplication(
            @PathVariable Long applicationId,
            Principal principal
    ) {
        AiScreeningResultDto result = screeningService.screenApplication(applicationId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("AI screening completed successfully", result));
    }

    @GetMapping("/{applicationId}")
    @Operation(summary = "Get AI screening results for an application", description = "Recruiters and Company Admins see results for their tenant. Candidates see their own.")
    public ResponseEntity<ApiResponse<AiScreeningResultDto>> getScreeningResult(
            @PathVariable Long applicationId,
            Principal principal
    ) {
        AiScreeningResultDto result = screeningService.getScreeningResultByApplicationId(applicationId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("AI screening result retrieved successfully", result));
    }
}
