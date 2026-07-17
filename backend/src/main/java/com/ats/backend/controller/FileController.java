package com.ats.backend.controller;

import com.ats.backend.entity.User;
import com.ats.backend.exception.ResourceNotFoundException;
import com.ats.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "File Controller", description = "Endpoints for secure file serving")
@SecurityRequirement(name = "bearerAuth")
public class FileController {

    private final UserRepository userRepository;

    public FileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/resumes/{filename}")
    @Operation(summary = "Download/View candidate resume securely", description = "Accessible by RECRUITER, ADMIN, or the owner CANDIDATE.")
    public ResponseEntity<Resource> downloadResume(
            @PathVariable String filename,
            Authentication authentication
    ) {
        try {
            String[] parts = filename.split("_", 2);
            if (parts.length < 2) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            Long fileOwnerId = Long.parseLong(parts[0]);

            boolean isAdminOrRecruiter = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_RECRUITER"));

            if (!isAdminOrRecruiter) {
                User currentUser = userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));
                if (!currentUser.getId().equals(fileOwnerId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            }

            User fileOwner = userRepository.findById(fileOwnerId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + fileOwnerId));

            if (fileOwner.getResumeData() != null && fileOwner.getResumeData().length > 0) {
                String contentType = fileOwner.getResumeContentType() != null ? fileOwner.getResumeContentType() : "application/pdf";
                String downloadFilename = fileOwner.getResumeFilename() != null ? fileOwner.getResumeFilename() : "resume.pdf";

                org.springframework.http.ContentDisposition contentDisposition = org.springframework.http.ContentDisposition.builder("inline")
                        .filename(downloadFilename)
                        .build();

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                        .body(new ByteArrayResource(fileOwner.getResumeData()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
