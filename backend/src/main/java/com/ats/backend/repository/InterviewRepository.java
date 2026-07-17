package com.ats.backend.repository;

import com.ats.backend.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    @Query("SELECT i FROM Interview i " +
           "JOIN FETCH i.application a " +
           "JOIN FETCH a.job j " +
           "JOIN FETCH i.recruiter r " +
           "JOIN FETCH i.interviewer iv " +
           "JOIN FETCH i.candidate c " +
           "WHERE i.application.id = :applicationId " +
           "ORDER BY i.scheduledDateTime DESC")
    List<Interview> findByApplicationIdOrderByScheduledDateTimeDesc(@Param("applicationId") Long applicationId);

    @Query("SELECT i FROM Interview i " +
           "JOIN FETCH i.application a " +
           "JOIN FETCH a.job j " +
           "JOIN FETCH i.recruiter r " +
           "JOIN FETCH i.interviewer iv " +
           "JOIN FETCH i.candidate c " +
           "WHERE i.candidate.email = :email " +
           "ORDER BY i.scheduledDateTime DESC")
    List<Interview> findByCandidateEmailOrderByScheduledDateTimeDesc(@Param("email") String email);

    @Query("SELECT i FROM Interview i " +
           "JOIN FETCH i.application a " +
           "JOIN FETCH a.job j " +
           "JOIN FETCH i.recruiter r " +
           "JOIN FETCH i.interviewer iv " +
           "JOIN FETCH i.candidate c " +
           "WHERE i.recruiter.email = :email " +
           "ORDER BY i.scheduledDateTime DESC")
    List<Interview> findByRecruiterEmailOrderByScheduledDateTimeDesc(@Param("email") String email);
}
