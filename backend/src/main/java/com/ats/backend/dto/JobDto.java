package com.ats.backend.dto;

import com.ats.backend.entity.JobStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDto {

    private Long id;

    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Company name is required")
    private String company;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Job description is required")
    private String description;

    @NotBlank(message = "Employment type is required")
    private String employmentType;

    @NotBlank(message = "Experience required is required")
    private String experienceRequired;

    @NotBlank(message = "Salary range is required")
    private String salaryRange;

    @NotNull(message = "Job status is required")
    private JobStatus status;

    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    private Long recruiterId;
    
    private String recruiterName;

    private Long applicantCount;
}
