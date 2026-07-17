package com.ats.backend.service;

import com.ats.backend.dto.NotificationDto;
import com.ats.backend.entity.NotificationType;
import com.ats.backend.entity.User;
import org.springframework.data.domain.Page;

public interface NotificationService {

    NotificationDto createNotification(User recipient, String title, String message, NotificationType type, Long relatedEntityId, String navigationUrl);

    Page<NotificationDto> getUserNotifications(String userEmail, int page, int size);

    Page<NotificationDto> getUnreadUserNotifications(String userEmail, int page, int size);

    long getUnreadCount(String userEmail);

    NotificationDto markAsRead(Long notificationId, String userEmail);

    void markAllAsRead(String userEmail);

    void deleteNotification(Long notificationId, String userEmail);
}
