package com.ats.backend.repository;

import com.ats.backend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    Page<Notification> findByRecipientIdAndReadStatusOrderByCreatedAtDesc(Long recipientId, boolean readStatus, Pageable pageable);

    long countByRecipientIdAndReadStatus(Long recipientId, boolean readStatus);

    @Modifying
    @Query("UPDATE Notification n SET n.readStatus = true WHERE n.recipient.id = :recipientId AND n.readStatus = false")
    int markAllAsReadForRecipient(@Param("recipientId") Long recipientId);
}
