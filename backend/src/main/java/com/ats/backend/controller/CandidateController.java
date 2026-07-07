package com.ats.backend.controller;

import com.ats.backend.dto.ApiResponse;
import com.ats.backend.dto.UserDto;
import com.ats.backend.entity.User;
import com.ats.backend.exception.InvalidRequestException;
import com.ats.backend.exception.ResourceNotFoundException;
import com.ats.backend.mapper.UserMapper;
import com.ats.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;

@RestController
@RequestMapping("/api/candidate")
@Tag(name = "Candidate Controller", description = "Endpoints restricted to CANDIDATE or ADMIN roles")
@SecurityRequirement(name = "bearerAuth")
public class CandidateController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public CandidateController(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get candidate dashboard data", description = "Accessible by CANDIDATE and ADMIN roles.")
    public ResponseEntity<ApiResponse<String>> getCandidateDashboard() {
        return ResponseEntity.ok(ApiResponse.success(
                "Access granted to Candidate Dashboard", 
                "Application status, profile detail, and resume uploads are loaded."
        ));
    }

    @PostMapping("/resume")
    @Operation(summary = "Upload candidate resume", description = "Accepts a PDF, DOC, or DOCX file, stores it locally, and updates candidate profile.")
    public ResponseEntity<ApiResponse<UserDto>> uploadResume(
            @RequestParam("file") MultipartFile file,
            Principal principal
    ) {
        if (file.isEmpty()) {
            throw new InvalidRequestException("Uploaded file cannot be empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !(originalFilename.endsWith(".pdf") || originalFilename.endsWith(".docx") || originalFilename.endsWith(".doc"))) {
            throw new InvalidRequestException("Invalid file format. Only PDF, DOC, or DOCX files are allowed.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !(
                contentType.equals("application/pdf") || 
                contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") || 
                contentType.equals("application/msword")
        )) {
            throw new InvalidRequestException("Invalid MIME type. Only PDF, DOC, or DOCX files are allowed.");
        }

        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        try {
            Path uploadPath = Paths.get("./uploads/resumes");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String cleanFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
            String filename = user.getId() + "_" + System.currentTimeMillis() + "_" + cleanFilename;
            Path filePath = uploadPath.resolve(filename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Clean up previous resume file if it exists to avoid orphaned files
            String oldResumeUrl = user.getResumeUrl();
            if (oldResumeUrl != null && !oldResumeUrl.isEmpty()) {
                try {
                    String oldFilename = oldResumeUrl.substring(oldResumeUrl.lastIndexOf('/') + 1);
                    Path oldFilePath = uploadPath.resolve(oldFilename).normalize();
                    if (oldFilePath.startsWith(uploadPath.normalize()) && Files.exists(oldFilePath)) {
                        Files.delete(oldFilePath);
                    }
                } catch (Exception e) {
                    System.err.println("Warning: Failed to delete old resume file: " + e.getMessage());
                }
            }

            String resumeUrl = "/api/resumes/" + filename;
            user.setResumeUrl(resumeUrl);
            User savedUser = userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("Resume uploaded successfully", userMapper.toDto(savedUser)));
        } catch (IOException e) {
            throw new RuntimeException("Failed to store resume file: " + e.getMessage(), e);
        }
    }
}
