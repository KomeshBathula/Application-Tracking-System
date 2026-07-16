package com.ats.backend.controller;

import com.ats.backend.dto.ApiResponse;
import com.ats.backend.dto.ApplicationDto;
import com.ats.backend.dto.ApplicationStatusHistoryDto;
import com.ats.backend.entity.ApplicationStatus;
import com.ats.backend.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Application Controller", description = "Endpoints for managing job applications and hiring pipeline")
@SecurityRequirement(name = "bearerAuth")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_CANDIDATE')")
    @Operation(summary = "Apply to a job posting", description = "Restricted to CANDIDATE role.")
    public ResponseEntity<ApiResponse<ApplicationDto>> applyToJob(
            @Valid @RequestBody ApplyRequest applyRequest,
            Principal principal
    ) {
        ApplicationDto applicationDto = applicationService.applyToJob(applyRequest.getJobId(), principal.getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job application submitted successfully", applicationDto));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ROLE_CANDIDATE', 'ROLE_ADMIN')")
    @Operation(summary = "Get candidate applications", description = "Retrieve logged-in candidate's applications with filtering and pagination.")
    public ResponseEntity<ApiResponse<Page<ApplicationDto>>> getMyApplications(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Principal principal
    ) {
        Page<ApplicationDto> applications = applicationService.getCandidateApplications(
                principal.getName(), status, search, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Applications list retrieved successfully", applications));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('ROLE_RECRUITER', 'ROLE_ADMIN')")
    @Operation(summary = "Get job applications", description = "Retrieve all applicants for a specific job posting. Restricted to the recruiter who created the job or ADMIN.")
    public ResponseEntity<ApiResponse<Page<ApplicationDto>>> getJobApplications(
            @PathVariable Long jobId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Principal principal
    ) {
        Page<ApplicationDto> applications = applicationService.getJobApplications(
                jobId, principal.getName(), status, search, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Applicants list retrieved successfully", applications));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ROLE_RECRUITER', 'ROLE_ADMIN')")
    @Operation(summary = "Update application status", description = "Update status of an application. Restricted to the recruiter who created the job or ADMIN.")
    public ResponseEntity<ApiResponse<ApplicationDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest statusUpdateRequest,
            Principal principal
    ) {
        ApplicationDto applicationDto = applicationService.updateApplicationStatus(
                id, statusUpdateRequest.getStatus(), statusUpdateRequest.getNote(), principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Application status updated successfully", applicationDto));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ROLE_CANDIDATE', 'ROLE_RECRUITER', 'ROLE_ADMIN')")
    @Operation(summary = "Get application timeline", description = "Get full status history audit log for a specific application.")
    public ResponseEntity<ApiResponse<List<ApplicationStatusHistoryDto>>> getHistoryTimeline(
            @PathVariable Long id,
            Principal principal
    ) {
        List<ApplicationStatusHistoryDto> history = applicationService.getApplicationTimeline(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Application timeline retrieved successfully", history));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_CANDIDATE', 'ROLE_ADMIN')")
    @Operation(summary = "Withdraw application", description = "Withdraw a submitted job application. Restricted to CANDIDATE who submitted it or ADMIN.")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(
            @PathVariable Long id,
            Principal principal
    ) {
        applicationService.withdrawApplication(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Application withdrawn successfully", null));
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplyRequest {
        @NotNull(message = "Job ID is required")
        private Long jobId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        @NotNull(message = "New status is required")
        private ApplicationStatus status;
        private String note;
    }
}
