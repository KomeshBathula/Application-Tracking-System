package com.ats.backend.repository;

import com.ats.backend.entity.CompanyAiConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyAiConfigRepository extends JpaRepository<CompanyAiConfig, Long> {
    Optional<CompanyAiConfig> findByCompanyId(Long companyId);
}
