package com.SpringBoot.Tracker_78.repository;

import com.SpringBoot.Tracker_78.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.SpringBoot.Tracker_78.model.User;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);}