package com.ats.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ai_screening_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiScreeningResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Column(name = "experience_score")
    private Integer experienceScore;

    @Column(name = "education_score")
    private Integer educationScore;

    @Column(name = "projects_score")
    private Integer projectsScore;

    @Column(name = "certifications_score")
    private Integer certificationsScore;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ai_screening_strengths", joinColumns = @JoinColumn(name = "screening_result_id"))
    @Column(name = "strength", length = 1000)
    private List<String> strengths;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ai_screening_weaknesses", joinColumns = @JoinColumn(name = "screening_result_id"))
    @Column(name = "weakness", length = 1000)
    private List<String> weaknesses;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ai_screening_matched_skills", joinColumns = @JoinColumn(name = "screening_result_id"))
    @Column(name = "matched_skill", length = 255)
    private List<String> matchedSkills;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ai_screening_missing_skills", joinColumns = @JoinColumn(name = "screening_result_id"))
    @Column(name = "missing_skill", length = 255)
    private List<String> missingSkills;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation", nullable = false)
    private AiRecommendation recommendation;

    @Column(name = "raw_json_response", columnDefinition = "TEXT")
    private String rawJsonResponse;

    @Column(name = "prompt_version")
    private String promptVersion;

    @Column(name = "model_name")
    private String modelName;

    @Column(name = "prompt_tokens")
    private Integer promptTokens;

    @Column(name = "completion_tokens")
    private Integer completionTokens;

    @Column(name = "total_tokens")
    private Integer totalTokens;

    @Column(name = "cost_estimation")
    private Double costEstimation;

    @CreationTimestamp
    @Column(name = "screened_at", nullable = false, updatable = false)
    private LocalDateTime screenedAt;
}
