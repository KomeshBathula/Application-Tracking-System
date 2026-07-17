package com.ats.backend.dto;

import com.ats.backend.entity.ApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDto {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String company;
    private String location;
    private Long candidateId;
    private String candidateFullName;
    private String candidateEmail;
    private String resumeUrl;
    private ApplicationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String aiRecommendation;
    private Integer aiOverallScore;
}
