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
@RequestMapping("/api/admin")
@Tag(name = "Admin Controller", description = "Endpoints restricted to ADMIN role")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard data", description = "Accessible only by users with ADMIN role.")
    public ResponseEntity<ApiResponse<String>> getAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(
                "Access granted to Admin Dashboard", 
                "Administrative metrics and backend controls are loaded."
        ));
    }
}
