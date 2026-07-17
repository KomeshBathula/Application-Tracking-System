package com.ats.backend.repository;

import com.ats.backend.entity.AiScreeningResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiScreeningResultRepository extends JpaRepository<AiScreeningResult, Long> {
    Optional<AiScreeningResult> findByApplicationId(Long applicationId);
    boolean existsByApplicationId(Long applicationId);
    List<AiScreeningResult> findByApplicationJobId(Long jobId);
}
