package com.ats.backend.mapper;

import com.ats.backend.dto.JobDto;
import com.ats.backend.entity.Job;
import org.springframework.stereotype.Component;

@Component
public class JobMapper {

    public JobDto toDto(Job job) {
        if (job == null) {
            return null;
        }
        return JobDto.builder()
                .id(job.getId())
                .title(job.getTitle())
                .company(job.getCompany())
                .location(job.getLocation())
                .description(job.getDescription())
                .employmentType(job.getEmploymentType())
                .experienceRequired(job.getExperienceRequired())
                .salaryRange(job.getSalaryRange())
                .status(job.getStatus())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .recruiterId(job.getRecruiter().getId())
                .recruiterName(job.getRecruiter().getFullName())
                .build();
    }

    public JobDto toDto(Job job, long applicantCount) {
        if (job == null) {
            return null;
        }
        JobDto dto = toDto(job);
        dto.setApplicantCount(applicantCount);
        return dto;
    }
}
