package com.SpringBoot.Tracker_78.controller;

import com.SpringBoot.Tracker_78.dto.request.LocationUpdateRequestDTO;
import com.SpringBoot.Tracker_78.dto.response.LocationResponseDTO;
import com.SpringBoot.Tracker_78.service.LocationService;
import com.SpringBoot.Tracker_78.service.NotificationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class LocationWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(LocationWebSocketController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private LocationService locationService;

    @Autowired
    private NotificationService notificationService;

    @MessageMapping("/location.update")
    public void updateLocation(@Valid LocationUpdateRequestDTO request, Principal principal) {
        try {
            if (request == null || request.getCircleId() == null || request.getCircleId() <= 0) {
                logger.warn("Invalid location update request received via WebSocket");
                return;
            }

            String userId = extractUserIdFromWebSocket(principal);
            if (userId == null || userId.isEmpty()) {
                logger.warn("User ID could not be extracted from WebSocket session");
                return;
            }

            LocationResponseDTO location = locationService.updateLocation(userId, request);
            messagingTemplate.convertAndSend("/topic/circle/" + request.getCircleId(), location);

            if (request.getBatteryLevel() != null && request.getBatteryLevel() <= 20) {
                notificationService.sendLowBatteryNotification(
                        String.valueOf(request.getCircleId()),
                        location.getUsername(),
                        request.getBatteryLevel()
                );
            }

            if ("manual".equalsIgnoreCase(request.getStatusMessage())) {
                notificationService.sendManualLocationShareNotification(
                        String.valueOf(request.getCircleId()),
                        location.getUsername()
                );
            }
        } catch (Exception ex) {
            logger.error("Error processing location update via WebSocket: {}", ex.getMessage(), ex);
        }
    }

    private String extractUserIdFromWebSocket(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isEmpty()) {
            throw new IllegalArgumentException("User ID could not be extracted from WebSocket session");
        }
        return principal.getName();
    }
}