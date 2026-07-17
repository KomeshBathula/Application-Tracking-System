package com.ats.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private String notificationType;
    private boolean readStatus;
    private LocalDateTime createdAt;
    private Long relatedEntityId;
    private String navigationUrl;
}
