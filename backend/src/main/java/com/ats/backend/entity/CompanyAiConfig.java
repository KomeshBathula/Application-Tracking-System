package com.ats.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "company_ai_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyAiConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, unique = true)
    private Company company;

    @Column(name = "ai_provider", nullable = false)
    private String aiProvider; // e.g. "OPENAI", "GEMINI", "CLAUDE"

    @Column(name = "api_key", nullable = false)
    private String apiKey;

    @Column(name = "model_name", nullable = false)
    private String modelName; // e.g. "gpt-4o", "gemini-1.5-pro"

    @Column(name = "resume_analysis_prompt", columnDefinition = "TEXT")
    private String resumeAnalysisPrompt;

    @Builder.Default
    @Column(name = "temperature")
    private Double temperature = 0.2;

    @Builder.Default
    @Column(name = "max_tokens")
    private Integer maxTokens = 2000;

    @Builder.Default
    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
