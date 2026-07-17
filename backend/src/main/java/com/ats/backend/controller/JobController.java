package com.ats.backend.controller;

import com.ats.backend.dto.ApiResponse;
import com.ats.backend.dto.JobDto;
import com.ats.backend.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Job Controller", description = "Endpoints for managing job postings")
@SecurityRequirement(name = "bearerAuth")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Create a new job posting", description = "Restricted to RECRUITER or ADMIN roles.")
    public ResponseEntity<ApiResponse<JobDto>> createJob(@Valid @RequestBody JobDto jobDto, Principal principal) {
        JobDto createdJob = jobService.createJob(jobDto, principal.getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job posting created successfully", createdJob));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Update an existing job posting", description = "Restricted to RECRUITER or ADMIN roles.")
    public ResponseEntity<ApiResponse<JobDto>> updateJob(@PathVariable Long id, @Valid @RequestBody JobDto jobDto, Principal principal) {
        JobDto updatedJob = jobService.updateJob(id, jobDto, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Job posting updated successfully", updatedJob));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Delete a job posting", description = "Restricted to RECRUITER or ADMIN roles.")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long id, Principal principal) {
        jobService.deleteJob(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Job posting deleted successfully", null));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a job posting by ID", description = "Accessible by all authenticated users.")
    public ResponseEntity<ApiResponse<JobDto>> getJobById(@PathVariable Long id) {
        JobDto jobDto = jobService.getJobById(id);
        return ResponseEntity.ok(ApiResponse.success("Job details retrieved successfully", jobDto));
    }

    @GetMapping
    @Operation(summary = "Search and list job postings", description = "Supports pagination, sorting, and filtering. Candidates are restricted to OPEN jobs.")
    public ResponseEntity<ApiResponse<Page<JobDto>>> getAllJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication
    ) {
        // Enforce Candidates can only see OPEN jobs
        boolean isCandidateOnly = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CANDIDATE"));

        String statusFilter = status;
        if (isCandidateOnly) {
            statusFilter = "OPEN";
        }

        Long companyId = null;
        if (authentication != null && authentication.getPrincipal() instanceof com.ats.backend.security.CustomUserDetails) {
            com.ats.backend.entity.User user = ((com.ats.backend.security.CustomUserDetails) authentication.getPrincipal()).getUser();
            boolean isTenantUser = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_RECRUITER") || a.getAuthority().equals("ROLE_COMPANY_ADMIN"));
            if (isTenantUser && user.getCompany() != null) {
                companyId = user.getCompany().getId();
            }
        }

        Page<JobDto> jobs = jobService.getAllJobs(title, company, location, employmentType, statusFilter, companyId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Jobs list retrieved successfully", jobs));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Get job counts stats", description = "Restricted to RECRUITER or ADMIN roles.")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getJobStats(Principal principal) {
        Map<String, Long> stats = jobService.getJobStats(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Job stats retrieved successfully", stats));
    }
}
