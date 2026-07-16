package com.ats.backend.repository;

import com.ats.backend.entity.ApplicationStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationStatusHistoryRepository extends JpaRepository<ApplicationStatusHistory, Long> {

    @Query("SELECT h FROM ApplicationStatusHistory h " +
           "JOIN FETCH h.changedBy " +
           "WHERE h.application.id = :applicationId " +
           "ORDER BY h.createdAt ASC")
    List<ApplicationStatusHistory> findByApplicationIdOrderByCreatedAtAsc(@Param("applicationId") Long applicationId);
}
