package com.ats.backend.controller;

import com.ats.backend.dto.ApiResponse;
import com.ats.backend.entity.Company;
import com.ats.backend.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/companies")
@Tag(name = "Company Administration", description = "Endpoints for managing SaaS companies (restricted to Platform Administrator)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    @Operation(summary = "Create a new company", description = "Restricted to Platform Administrator.")
    public ResponseEntity<ApiResponse<Company>> createCompany(@Valid @RequestBody Company company) {
        Company created = companyService.createCompany(company);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Company created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing company", description = "Restricted to Platform Administrator.")
    public ResponseEntity<ApiResponse<Company>> updateCompany(@PathVariable Long id, @Valid @RequestBody Company company) {
        Company updated = companyService.updateCompany(id, company);
        return ResponseEntity.ok(ApiResponse.success("Company updated successfully", updated));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get company details by ID", description = "Restricted to Platform Administrator.")
    public ResponseEntity<ApiResponse<Company>> getCompanyById(@PathVariable Long id) {
        Company company = companyService.getCompanyById(id);
        return ResponseEntity.ok(ApiResponse.success("Company retrieved successfully", company));
    }

    @GetMapping
    @Operation(summary = "Get list of all companies", description = "Restricted to Platform Administrator.")
    public ResponseEntity<ApiResponse<List<Company>>> getAllCompanies() {
        List<Company> companies = companyService.getAllCompanies();
        return ResponseEntity.ok(ApiResponse.success("Companies retrieved successfully", companies));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a company", description = "Restricted to Platform Administrator.")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok(ApiResponse.success("Company deleted successfully", null));
    }
}
