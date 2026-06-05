package com.ats.backend.controller;

import com.ats.backend.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/candidate")
@Tag(name = "Candidate Controller", description = "Endpoints restricted to CANDIDATE or ADMIN roles")
@SecurityRequirement(name = "bearerAuth")
public class CandidateController {

    @GetMapping("/dashboard")
    @Operation(summary = "Get candidate dashboard data", description = "Accessible by CANDIDATE and ADMIN roles.")
    public ResponseEntity<ApiResponse<String>> getCandidateDashboard() {
        return ResponseEntity.ok(ApiResponse.success(
                "Access granted to Candidate Dashboard", 
                "Application status, profile detail, and resume uploads are loaded."
        ));
    }
}
