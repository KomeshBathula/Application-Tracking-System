package com.ats.backend.controller;

import com.ats.backend.dto.ApiResponse;
import com.ats.backend.dto.UserDto;
import com.ats.backend.entity.RoleName;
import com.ats.backend.mapper.UserMapper;
import com.ats.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recruiter")
@PreAuthorize("hasAnyRole('ROLE_RECRUITER', 'ROLE_ADMIN')")
@Tag(name = "Recruiter Controller", description = "Endpoints restricted to RECRUITER or ADMIN roles")
@SecurityRequirement(name = "bearerAuth")
public class RecruiterController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public RecruiterController(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get recruiter dashboard data", description = "Accessible by RECRUITER and ADMIN roles.")
    public ResponseEntity<ApiResponse<String>> getRecruiterDashboard() {
        return ResponseEntity.ok(ApiResponse.success(
                "Access granted to Recruiter Dashboard", 
                "Recruitment metrics, job postings, and active pipelines are loaded."
        ));
    }

    @GetMapping("/candidates")
    @Operation(summary = "Get candidate list", description = "Accessible by RECRUITER and ADMIN roles. Returns all registered candidates with their resumes.")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getCandidates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UserDto> candidates = userRepository.findByRoleRoleName(RoleName.ROLE_CANDIDATE, PageRequest.of(page, size))
                .map(userMapper::toDto);
        return ResponseEntity.ok(ApiResponse.success("Candidates list retrieved successfully", candidates));
    }

    @GetMapping("/interviewers")
    @Operation(summary = "Get potential interviewers list", description = "Accessible by RECRUITER and ADMIN roles.")
    public ResponseEntity<ApiResponse<List<UserDto>>> getInterviewers() {
        List<UserDto> interviewers = userRepository.findByRoleRoleName(RoleName.ROLE_RECRUITER, PageRequest.of(0, 100))
                .getContent().stream().map(userMapper::toDto).toList();
        return ResponseEntity.ok(ApiResponse.success("Interviewers list retrieved successfully", interviewers));
    }
}
