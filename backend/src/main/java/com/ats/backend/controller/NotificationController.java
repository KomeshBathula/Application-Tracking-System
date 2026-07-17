package com.ats.backend.controller;

import com.ats.backend.dto.ApiResponse;
import com.ats.backend.dto.NotificationDto;
import com.ats.backend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification Controller", description = "Endpoints for managing in-app notifications")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ROLE_CANDIDATE', 'ROLE_RECRUITER', 'ROLE_ADMIN')")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get user notifications", description = "Retrieve paginated notifications for the logged-in user.")
    public ResponseEntity<ApiResponse<Page<NotificationDto>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            Principal principal
    ) {
        Page<NotificationDto> notifications;
        if (unreadOnly) {
            notifications = notificationService.getUnreadUserNotifications(principal.getName(), page, size);
        } else {
            notifications = notificationService.getUserNotifications(principal.getName(), page, size);
        }
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", notifications));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count", description = "Retrieve count of unread notifications for the logged-in user.")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Principal principal) {
        long count = notificationService.getUnreadCount(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Unread notification count retrieved successfully", count));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read", description = "Mark a specific notification as read. Restricted to the notification recipient or ADMIN.")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(
            @PathVariable Long id,
            Principal principal
    ) {
        NotificationDto notificationDto = notificationService.markAsRead(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read successfully", notificationDto));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read", description = "Mark all notifications for the logged-in user as read.")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Principal principal) {
        notificationService.markAllAsRead(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read successfully", null));
    }
}
