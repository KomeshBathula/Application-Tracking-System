package com.ats.backend.service;

import com.ats.backend.dto.JobDto;
import org.springframework.data.domain.Page;

import java.util.Map;

public interface JobService {
    JobDto createJob(JobDto jobDto, String recruiterEmail);
    JobDto updateJob(Long id, JobDto jobDto, String recruiterEmail);
    void deleteJob(Long id, String recruiterEmail);
    JobDto getJobById(Long id);
    Page<JobDto> getAllJobs(String title, String company, String location, String employmentType, String status, Long companyId, int page, int size, String sortBy, String sortDir);
    Map<String, Long> getJobStats(String recruiterEmail);
}
