package com.ats.backend.controller;

import com.ats.backend.dto.ApiResponse;
import com.ats.backend.dto.InterviewDto;
import com.ats.backend.dto.ScheduleInterviewRequest;
import com.ats.backend.dto.UpdateInterviewRequest;
import com.ats.backend.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@Tag(name = "Interview Controller", description = "Endpoints for managing interview schedules")
@SecurityRequirement(name = "bearerAuth")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_RECRUITER', 'ROLE_ADMIN')")
    @Operation(summary = "Schedule a new interview", description = "Restricted to RECRUITER or ADMIN role.")
    public ResponseEntity<ApiResponse<InterviewDto>> scheduleInterview(
            @Valid @RequestBody ScheduleInterviewRequest request,
            Principal principal
    ) {
        InterviewDto interviewDto = interviewService.scheduleInterview(request, principal.getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Interview scheduled successfully", interviewDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_RECRUITER', 'ROLE_ADMIN')")
    @Operation(summary = "Update an existing interview", description = "Restricted to RECRUITER who owns the job or ADMIN.")
    public ResponseEntity<ApiResponse<InterviewDto>> updateInterview(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInterviewRequest request,
            Principal principal
    ) {
        InterviewDto interviewDto = interviewService.updateInterview(id, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Interview updated successfully", interviewDto));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ROLE_RECRUITER', 'ROLE_ADMIN')")
    @Operation(summary = "Cancel an interview", description = "Restricted to RECRUITER who owns the job or ADMIN.")
    public ResponseEntity<ApiResponse<InterviewDto>> cancelInterview(
            @PathVariable Long id,
            @RequestParam(required = false) String note,
            Principal principal
    ) {
        InterviewDto interviewDto = interviewService.cancelInterview(id, note, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Interview cancelled successfully", interviewDto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_CANDIDATE', 'ROLE_RECRUITER', 'ROLE_ADMIN')")
    @Operation(summary = "Get interview details", description = "Access restricted to associated Candidate, Recruiter, Interviewer, or ADMIN.")
    public ResponseEntity<ApiResponse<InterviewDto>> getInterviewById(
            @PathVariable Long id,
            Principal principal
    ) {
        InterviewDto interviewDto = interviewService.getInterviewById(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Interview details retrieved successfully", interviewDto));
    }

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasAnyRole('ROLE_CANDIDATE', 'ROLE_RECRUITER', 'ROLE_ADMIN')")
    @Operation(summary = "Get interviews for a specific application", description = "Access restricted to the Candidate who applied, Recruiter who owns the job, or ADMIN.")
    public ResponseEntity<ApiResponse<List<InterviewDto>>> getInterviewsByApplication(
            @PathVariable Long applicationId,
            Principal principal
    ) {
        List<InterviewDto> interviews = interviewService.getInterviewsByApplication(applicationId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Application interviews retrieved successfully", interviews));
    }

    @GetMapping("/candidate")
    @PreAuthorize("hasAnyRole('ROLE_CANDIDATE', 'ROLE_ADMIN')")
    @Operation(summary = "Get current candidate's interviews", description = "Retrieve list of all scheduled interviews for the logged-in candidate.")
    public ResponseEntity<ApiResponse<List<InterviewDto>>> getCandidateInterviews(Principal principal) {
        List<InterviewDto> interviews = interviewService.getCandidateInterviews(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Candidate interviews retrieved successfully", interviews));
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasAnyRole('ROLE_RECRUITER', 'ROLE_ADMIN')")
    @Operation(summary = "Get recruiter's scheduled interviews", description = "Retrieve list of scheduled interviews managed by the recruiter.")
    public ResponseEntity<ApiResponse<List<InterviewDto>>> getRecruiterInterviews(Principal principal) {
        List<InterviewDto> interviews = interviewService.getRecruiterInterviews(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Recruiter interviews retrieved successfully", interviews));
    }
}
