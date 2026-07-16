package com.ats.backend.service.impl;

import com.ats.backend.dto.JobDto;
import com.ats.backend.entity.Job;
import com.ats.backend.entity.JobStatus;
import com.ats.backend.entity.RoleName;
import com.ats.backend.entity.User;
import com.ats.backend.exception.InvalidRequestException;
import com.ats.backend.exception.JobNotFoundException;
import com.ats.backend.exception.ResourceNotFoundException;
import com.ats.backend.mapper.JobMapper;
import com.ats.backend.repository.JobRepository;
import com.ats.backend.repository.UserRepository;
import com.ats.backend.service.JobService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobMapper jobMapper;
    private final com.ats.backend.repository.ApplicationRepository applicationRepository;

    public JobServiceImpl(JobRepository jobRepository, UserRepository userRepository, JobMapper jobMapper, com.ats.backend.repository.ApplicationRepository applicationRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.jobMapper = jobMapper;
        this.applicationRepository = applicationRepository;
    }

    @Override
    @Transactional
    public JobDto createJob(JobDto jobDto, String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found: " + recruiterEmail));

        Job job = Job.builder()
                .title(jobDto.getTitle())
                .company(jobDto.getCompany())
                .location(jobDto.getLocation())
                .description(jobDto.getDescription())
                .employmentType(jobDto.getEmploymentType())
                .experienceRequired(jobDto.getExperienceRequired())
                .salaryRange(jobDto.getSalaryRange())
                .status(jobDto.getStatus())
                .recruiter(recruiter)
                .build();

        Job savedJob = jobRepository.save(job);
        return jobMapper.toDto(savedJob, 0L);
    }

    @Override
    @Transactional
    public JobDto updateJob(Long id, JobDto jobDto, String recruiterEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new JobNotFoundException("Job not found with id: " + id));

        User user = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + recruiterEmail));

        // Recruiters can only update their own jobs. Admins can update any.
        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        if (!isAdmin && !job.getRecruiter().getId().equals(user.getId())) {
            throw new InvalidRequestException("You are not authorized to update this job posting.");
        }

        job.setTitle(jobDto.getTitle());
        job.setCompany(jobDto.getCompany());
        job.setLocation(jobDto.getLocation());
        job.setDescription(jobDto.getDescription());
        job.setEmploymentType(jobDto.getEmploymentType());
        job.setExperienceRequired(jobDto.getExperienceRequired());
        job.setSalaryRange(jobDto.getSalaryRange());
        job.setStatus(jobDto.getStatus());

        Job updatedJob = jobRepository.save(job);
        long count = applicationRepository.countByJobId(updatedJob.getId());
        return jobMapper.toDto(updatedJob, count);
    }

    @Override
    @Transactional
    public void deleteJob(Long id, String recruiterEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new JobNotFoundException("Job not found with id: " + id));

        User user = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + recruiterEmail));

        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        if (!isAdmin && !job.getRecruiter().getId().equals(user.getId())) {
            throw new InvalidRequestException("You are not authorized to delete this job posting.");
        }

        jobRepository.delete(job);
    }

    @Override
    @Transactional(readOnly = true)
    public JobDto getJobById(Long id) {
        Job job = jobRepository.findById(id)
                 .orElseThrow(() -> new JobNotFoundException("Job not found with id: " + id));
        long count = applicationRepository.countByJobId(job.getId());
        return jobMapper.toDto(job, count);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobDto> getAllJobs(String title, String company, String location, String employmentType, String status, int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        
        // Map frontend sorting property names if necessary
        String sortProp = sortBy;
        if (sortBy.equalsIgnoreCase("createdDate") || sortBy.equalsIgnoreCase("createdAt")) {
            sortProp = "createdAt";
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortProp));

        JobStatus jobStatusEnum = null;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                jobStatusEnum = JobStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new InvalidRequestException("Invalid status filter: " + status);
            }
        }

        Page<Job> jobsPage = jobRepository.searchJobs(
                (title == null || title.trim().isEmpty()) ? null : title,
                (company == null || company.trim().isEmpty()) ? null : company,
                (location == null || location.trim().isEmpty()) ? null : location,
                (employmentType == null || employmentType.trim().isEmpty()) ? null : employmentType,
                jobStatusEnum,
                pageable
        );

        List<Long> jobIds = jobsPage.getContent().stream().map(Job::getId).collect(java.util.stream.Collectors.toList());
        Map<Long, Long> countsMap = jobIds.isEmpty() ? new HashMap<>() :
                applicationRepository.countByJobIds(jobIds).stream()
                        .collect(java.util.stream.Collectors.toMap(
                                row -> (Long) row[0],
                                row -> (Long) row[1]
                        ));

        return jobsPage.map(job -> jobMapper.toDto(job, countsMap.getOrDefault(job.getId(), 0L)));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getJobStats(String recruiterEmail) {
        User user = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + recruiterEmail));

        List<Job> allJobs = jobRepository.findAll();
        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;

        long total = 0;
        long open = 0;
        long closed = 0;

        for (Job job : allJobs) {
            // Admin sees global stats; Recruiters see their own stats
            if (isAdmin || job.getRecruiter().getId().equals(user.getId())) {
                total++;
                if (job.getStatus() == JobStatus.OPEN) {
                    open++;
                } else if (job.getStatus() == JobStatus.CLOSED) {
                    closed++;
                }
            }
        }

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalJobs", total);
        stats.put("openJobs", open);
        stats.put("closedJobs", closed);
        return stats;
    }
}
