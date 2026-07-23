package com.ats.backend.controller;

import com.ats.backend.dto.ApiResponse;
import com.ats.backend.dto.CreateCompanyAdminRequest;
import com.ats.backend.dto.UserDto;
import com.ats.backend.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Controller", description = "Endpoints restricted to ADMIN role")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard data", description = "Accessible only by users with ADMIN role.")
    public ResponseEntity<ApiResponse<String>> getAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(
                "Access granted to Admin Dashboard", 
                "Administrative metrics and backend controls are loaded."
        ));
    }

    @PostMapping("/company-admins")
    @Operation(summary = "Create Company Admin", description = "Super Admin creates a new Company Admin user.")
    public ResponseEntity<ApiResponse<UserDto>> createCompanyAdmin(@Valid @RequestBody CreateCompanyAdminRequest request) {
        UserDto created = adminService.createCompanyAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Company Admin created successfully", created));
    }

    @GetMapping("/users")
    @Operation(summary = "Get users (Scalable & Paginated)", description = "Fetches a scalable, paginated list of users with search and role filters.")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Long companyId,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        int validPage = Math.max(0, page);
        int validSize = Math.max(1, Math.min(size, 100));

        java.util.Set<String> allowedSorts = java.util.Set.of("createdAt", "fullName", "username", "email", "id");
        String cleanSortBy = allowedSorts.contains(sortBy) ? sortBy : "createdAt";

        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(cleanSortBy).ascending() : Sort.by(cleanSortBy).descending();
        Pageable pageable = PageRequest.of(validPage, validSize, sort);
        
        Page<UserDto> usersPage = adminService.getUsersPaginated(search, role, companyId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", usersPage));
    }

    @PatchMapping("/users/{userId}/status")
    @Operation(summary = "Toggle User Enabled Status", description = "Enables or disables a user account.")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(
            @PathVariable Long userId,
            @RequestParam boolean enabled,
            org.springframework.security.core.Authentication authentication) {
        UserDto updated = adminService.toggleUserStatus(authentication.getName(), userId, enabled);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", updated));
    }
}
