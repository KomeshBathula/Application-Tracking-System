package com.ats.backend.repository;

import com.ats.backend.entity.Job;
import com.ats.backend.entity.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("SELECT j FROM Job j WHERE " +
            "(:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:company IS NULL OR LOWER(j.company) LIKE LOWER(CONCAT('%', :company, '%'))) AND " +
            "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:employmentType IS NULL OR LOWER(j.employmentType) LIKE LOWER(CONCAT('%', :employmentType, '%'))) AND " +
            "(:status IS NULL OR j.status = :status) AND " +
            "(:companyId IS NULL OR j.companyEntity.id = :companyId)")
    Page<Job> searchJobs(
            @Param("title") String title,
            @Param("company") String company,
            @Param("location") String location,
            @Param("employmentType") String employmentType,
            @Param("status") JobStatus status,
            @Param("companyId") Long companyId,
            Pageable pageable
    );
}
