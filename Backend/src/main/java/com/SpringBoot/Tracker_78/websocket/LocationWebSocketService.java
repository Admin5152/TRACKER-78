package com.SpringBoot.Tracker_78.websocket;

import com.SpringBoot.Tracker_78.dto.LocationUpdateDTO;
import com.SpringBoot.Tracker_78.exception.WebSocketException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.websocket.Session;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class LocationWebSocketService {

    private final Map<Long, Map<Long, Session>> circleSessions = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();

    public synchronized void addSession(Long circleId, Long userId, Session session) {
        circleSessions.computeIfAbsent(circleId, k -> new ConcurrentHashMap<>())
                .compute(userId, (k, existingSession) -> {
                    if (existingSession != null && existingSession.isOpen()) {
                        try {
                            existingSession.close();
                        } catch (IOException e) {
                            log.warn("Failed to close existing session for user {} in circle {}", userId, circleId, e);
                        }
                    }
                    return session;
                });
        log.debug("Added session for user {} in circle {}", userId, circleId);
    }

    public synchronized void removeSession(Long circleId, Long userId) {
        if (circleSessions.containsKey(circleId)) {
            Session session = circleSessions.get(circleId).remove(userId);
            if (session != null && session.isOpen()) {
                try {
                    session.close();
                } catch (IOException e) {
                    log.warn("Failed to close session while removing user {} from circle {}", userId, circleId, e);
                }
            }
            log.debug("Removed session for user {} in circle {}", userId, circleId);

            if (circleSessions.get(circleId).isEmpty()) {
                circleSessions.remove(circleId);
                log.debug("Removed empty circle session map for circle {}", circleId);
            }
        }
    }

    public void broadcastLocation(Long userId,
                                  Double latitude,
                                  Double longitude,
                                  String address,
                                  String statusMessage,
                                  Long circleId) {
        if (!circleSessions.containsKey(circleId)) {
            log.debug("No active sessions for circle {}", circleId);
            return;
        }

        LocationUpdateDTO updateDTO = new LocationUpdateDTO();
        updateDTO.setUserId(userId);
        updateDTO.setLatitude(latitude);
        updateDTO.setLongitude(longitude);
        updateDTO.setAddress(address);
        updateDTO.setStatusMessage(statusMessage);

        try {
            String message = mapper.writeValueAsString(updateDTO);
            Map<Long, Session> userSessions = circleSessions.get(circleId);

            userSessions.forEach((sessionUserId, session) -> {
                if (session.isOpen()) {
                    try {
                        session.getBasicRemote().sendText(message);
                        log.trace("Sent location update to user {} in circle {}", sessionUserId, circleId);
                    } catch (IOException e) {
                        log.warn("Failed to send message to user {} in circle {}", sessionUserId, circleId, e);
                        removeSession(circleId, sessionUserId);
                    }
                } else {
                    removeSession(circleId, sessionUserId);
                }
            });
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize location update for circle {}", circleId, e);
            throw new WebSocketException("Failed to serialize location update", e);
        }
    }

    public int getActiveSessionCount(Long circleId) {
        return circleSessions.getOrDefault(circleId, Map.of()).size();
    }

    public synchronized void closeAllSessionsForCircle(Long circleId) {
        if (circleSessions.containsKey(circleId)) {
            Map<Long, Session> sessions = circleSessions.remove(circleId);
            sessions.forEach((userId, session) -> {
                if (session.isOpen()) {
                    try {
                        session.close();
                    } catch (IOException e) {
                        log.warn("Failed to close session for user {} in circle {}", userId, circleId, e);
                    }
                }
            });
            log.info("Closed all sessions for circle {}", circleId);
        }
    }
}