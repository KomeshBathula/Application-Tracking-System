package com.ats.backend.repository;

import com.ats.backend.entity.Application;
import com.ats.backend.entity.ApplicationStatus;
import com.ats.backend.entity.Job;
import com.ats.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    @Query(value = "SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH j.recruiter WHERE a.candidate.id = :candidateId",
           countQuery = "SELECT COUNT(a) FROM Application a WHERE a.candidate.id = :candidateId")
    Page<Application> findByCandidateId(@Param("candidateId") Long candidateId, Pageable pageable);

    @Query(value = "SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH j.recruiter WHERE a.candidate.id = :candidateId " +
            "AND (:status IS NULL OR a.status = :status) " +
            "AND (:search IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.company) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(a) FROM Application a JOIN a.job j WHERE a.candidate.id = :candidateId " +
            "AND (:status IS NULL OR a.status = :status) " +
            "AND (:search IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.company) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Application> findByCandidateIdWithFilters(
            @Param("candidateId") Long candidateId,
            @Param("status") ApplicationStatus status,
            @Param("search") String search,
            Pageable pageable);

    @Query(value = "SELECT a FROM Application a JOIN FETCH a.candidate WHERE a.job.id = :jobId",
           countQuery = "SELECT COUNT(a) FROM Application a WHERE a.job.id = :jobId")
    Page<Application> findByJobId(@Param("jobId") Long jobId, Pageable pageable);

    @Query(value = "SELECT a FROM Application a JOIN FETCH a.candidate c WHERE a.job.id = :jobId " +
            "AND (:status IS NULL OR a.status = :status) " +
            "AND (:search IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(a) FROM Application a JOIN a.candidate c WHERE a.job.id = :jobId " +
            "AND (:status IS NULL OR a.status = :status) " +
            "AND (:search IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Application> findByJobIdWithFilters(
            @Param("jobId") Long jobId,
            @Param("status") ApplicationStatus status,
            @Param("search") String search,
            Pageable pageable);

    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

    java.util.Optional<Application> findByJobIdAndCandidateId(Long jobId, Long candidateId);

    List<Application> findByStatus(ApplicationStatus status);

    long countByJob(Job job);

    long countByJobId(Long jobId);

    @Query("SELECT a.job.id, COUNT(a) FROM Application a WHERE a.job.id IN :jobIds GROUP BY a.job.id")
    List<Object[]> countByJobIds(@Param("jobIds") List<Long> jobIds);

    long countByCandidate(User candidate);

    long countByCandidateId(Long candidateId);
}
