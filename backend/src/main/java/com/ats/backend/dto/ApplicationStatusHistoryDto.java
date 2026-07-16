package com.ats.backend.dto;

import com.ats.backend.entity.ApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationStatusHistoryDto {
    private Long id;
    private Long applicationId;
    private ApplicationStatus previousStatus;
    private ApplicationStatus newStatus;
    private Long changedById;
    private String changedByName;
    private String changedByEmail;
    private String note;
    private LocalDateTime createdAt;
}
