package com.SpringBoot.Tracker_78.controller;

import com.SpringBoot.Tracker_78.dto.request.NotificationRequestDTO;
import com.SpringBoot.Tracker_78.dto.response.NotificationResponseDTO;
import com.SpringBoot.Tracker_78.model.Notification;
import com.SpringBoot.Tracker_78.model.User;
import com.SpringBoot.Tracker_78.service.NotificationService;
import com.SpringBoot.Tracker_78.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllNotifications(Principal principal) {
        try {
            if (principal == null || principal.getName() == null) {
                return ResponseEntity.badRequest().body("Invalid user principal");
            }
            User user = userService.findByUsername(principal.getName());
            List<Notification> notifications = notificationService.getNotificationsForUser(user);
            return ResponseEntity.ok(notifications);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to fetch notifications: " + ex.getMessage());
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(Principal principal) {
        try {
            if (principal == null || principal.getName() == null) {
                return ResponseEntity.badRequest().body("Invalid user principal");
            }
            User user = userService.findByUsername(principal.getName());
            List<Notification> unread = notificationService.getUnreadNotificationsForUser(user);
            return ResponseEntity.ok(unread);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to fetch unread notifications: " + ex.getMessage());
        }
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest().body("Invalid notification id");
            }
            Notification notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(notification);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to mark notification as read: " + ex.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createNotification(@Valid @RequestBody NotificationRequestDTO requestDTO) {
        try {
            if (requestDTO == null || requestDTO.getRecipientId() == null) {
                return ResponseEntity.badRequest().body("Invalid notification request");
            }
            Notification notification = notificationService.createNotification(
                    requestDTO.getMessage(),
                    Notification.NotificationType.valueOf(requestDTO.getType()),
                    userService.findById(requestDTO.getRecipientId()),
                    requestDTO.getRelatedEntityId(),
                    requestDTO.getActionUrl()
            );
            NotificationResponseDTO responseDTO = notificationService.toResponseDTO(notification);
            notificationService.broadcastNotification(responseDTO, requestDTO.getRecipientId());
            return ResponseEntity.ok(responseDTO);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to create notification: " + ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, Principal principal) {
        try {
            if (principal == null || principal.getName() == null) {
                return ResponseEntity.badRequest().body("Invalid user principal");
            }
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest().body("Invalid notification id");
            }
            User user = userService.findByUsername(principal.getName());
            notificationService.deleteNotification(id, user);
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to delete notification: " + ex.getMessage());
        }
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(Principal principal) {
        try {
            if (principal == null || principal.getName() == null) {
                return ResponseEntity.badRequest().body("Invalid user principal");
            }
            User user = userService.findByUsername(principal.getName());
            notificationService.markAllAsRead(user);
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Failed to mark all notifications as read: " + ex.getMessage());
        }
    }
}