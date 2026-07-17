package com.ats.backend.service.impl;

import com.ats.backend.dto.NotificationDto;
import com.ats.backend.entity.Notification;
import com.ats.backend.entity.NotificationType;
import com.ats.backend.entity.RoleName;
import com.ats.backend.entity.User;
import com.ats.backend.exception.InvalidRequestException;
import com.ats.backend.exception.ResourceNotFoundException;
import com.ats.backend.mapper.NotificationMapper;
import com.ats.backend.repository.NotificationRepository;
import com.ats.backend.repository.UserRepository;
import com.ats.backend.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            NotificationMapper notificationMapper
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationMapper = notificationMapper;
    }

    @Override
    @Transactional
    public NotificationDto createNotification(User recipient, String title, String message, NotificationType type, Long relatedEntityId, String navigationUrl) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .notificationType(type)
                .relatedEntityId(relatedEntityId)
                .navigationUrl(navigationUrl)
                .readStatus(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        return notificationMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto> getUserNotifications(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        int validatedPage = Math.max(0, page);
        int validatedSize = Math.max(1, Math.min(100, size));
        Pageable pageable = PageRequest.of(validatedPage, validatedSize);
        Page<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId(), pageable);
        return notifications.map(notificationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto> getUnreadUserNotifications(String userEmail, int page, int size) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        int validatedPage = Math.max(0, page);
        int validatedSize = Math.max(1, Math.min(100, size));
        Pageable pageable = PageRequest.of(validatedPage, validatedSize);
        Page<Notification> notifications = notificationRepository.findByRecipientIdAndReadStatusOrderByCreatedAtDesc(user.getId(), false, pageable);
        return notifications.map(notificationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return notificationRepository.countByRecipientIdAndReadStatus(user.getId(), false);
    }

    @Override
    @Transactional
    public NotificationDto markAsRead(Long notificationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        if (!isAdmin && !notification.getRecipient().getId().equals(user.getId())) {
            throw new InvalidRequestException("You are not authorized to modify this notification.");
        }

        notification.setReadStatus(true);
        Notification saved = notificationRepository.save(notification);
        return notificationMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        notificationRepository.markAllAsReadForRecipient(user.getId());
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        if (!isAdmin && !notification.getRecipient().getId().equals(user.getId())) {
            throw new InvalidRequestException("You are not authorized to delete this notification.");
        }

        notificationRepository.delete(notification);
    }
}
