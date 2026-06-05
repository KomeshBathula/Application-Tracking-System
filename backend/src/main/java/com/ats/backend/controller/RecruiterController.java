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
@RequestMapping("/api/recruiter")
@Tag(name = "Recruiter Controller", description = "Endpoints restricted to RECRUITER or ADMIN roles")
@SecurityRequirement(name = "bearerAuth")
public class RecruiterController {

    @GetMapping("/dashboard")
    @Operation(summary = "Get recruiter dashboard data", description = "Accessible by RECRUITER and ADMIN roles.")
    public ResponseEntity<ApiResponse<String>> getRecruiterDashboard() {
        return ResponseEntity.ok(ApiResponse.success(
                "Access granted to Recruiter Dashboard", 
                "Recruitment metrics, job postings, and active pipelines are loaded."
        ));
    }
}
