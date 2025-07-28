package com.SpringBoot.Tracker_78.service;

import com.SpringBoot.Tracker_78.dto.response.CircleResponseDTO;
import com.SpringBoot.Tracker_78.dto.response.JoinCircleResponseDTO;
import com.SpringBoot.Tracker_78.dto.response.LocationResponseDTO;
import com.SpringBoot.Tracker_78.model.Circle;
import com.SpringBoot.Tracker_78.model.User;
import com.SpringBoot.Tracker_78.repository.CircleRepository;
import com.SpringBoot.Tracker_78.repository.LocationRepository;
import com.SpringBoot.Tracker_78.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.SpringBoot.Tracker_78.dto.CircleMemberDTO;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
public class CircleService {

    @Autowired
    private CircleRepository circleRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private UserRepository userRepository;

    public CircleResponseDTO createCircle(Circle circle) {
        if (circle.getUsers() == null) {
            circle.setUsers(new HashSet<>());
        }
        circle.setCreatedAt(LocalDateTime.now());

        User creator = userRepository.findByAppwriteId(circle.getCreatorAppwriteId())
                .orElseThrow(() -> new IllegalArgumentException("Creator not found"));

        circle.setAdmin(creator);

        String code = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        circle.setCode(code);

        circle.getUsers().add(creator);

        Circle savedCircle = circleRepository.save(circle);
        return toDTO(savedCircle);
    }

    public CircleResponseDTO createCircleWithInvite(Circle circle) {
        CircleResponseDTO dto = createCircle(circle);
        Circle savedCircle = circleRepository.findById(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("Circle not found"));
        return toDTOWithInvite(savedCircle);
    }

    public CircleResponseDTO toDTOWithInvite(Circle circle) {
        CircleResponseDTO dto = toDTO(circle);
        String inviteLink = "https://yourdomain.com/api/circles/join?code=" + circle.getCode();
        dto.setInviteLink(inviteLink);
        return dto;
    }

    public CircleResponseDTO joinCircle(String appwriteId, String code) {
        Circle circle = circleRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Circle not found"));
        User user = userRepository.findByAppwriteId(appwriteId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setCircle(circle);
        userRepository.save(user);
        return toDTO(circle);
    }

    public void leaveCircle(String appwriteId, Long circleId) {
        User user = userRepository.findByAppwriteId(appwriteId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getCircle() != null && user.getCircle().getId().equals(circleId)) {
            user.setCircle(null);
            userRepository.save(user);
        }
    }

    public CircleResponseDTO updateCircleName(Long circleId, String newName) {
        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("Circle not found"));
        circle.setName(newName);
        Circle updatedCircle = circleRepository.save(circle);
        return toDTO(updatedCircle);
    }

    public List<String> getMembers(Long circleId) {
        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("Circle not found"));
        return circle.getUsers().stream()
                .map(user -> user.getId().toString())
                .collect(Collectors.toList());
    }

    private CircleResponseDTO toDTO(Circle circle) {
        return new CircleResponseDTO(
                circle.getId(),
                circle.getName(),
                circle.getCode(),
                circle.getCreatorAppwriteId(),
                circle.getCreatedAt()
        );
    }

    public JoinCircleResponseDTO joinCircleWithMembers(String appwriteId, String code) {
        Circle circle = circleRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Circle not found"));
        User user = userRepository.findByAppwriteId(appwriteId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!circle.getUsers().contains(user)) {
            circle.addMember(user);
            circleRepository.save(circle);
        }

        user.setCircle(circle);
        userRepository.save(user);

        List<CircleMemberDTO> members = circle.getUsers().stream()
                .map(u -> new CircleMemberDTO(
                        "user_" + u.getId(),
                        u.getName(),
                        circle.getAdmin() != null && u.getId().equals(circle.getAdmin().getId())
                ))
                .collect(Collectors.toList());

        JoinCircleResponseDTO.CircleDTO circleDTO = new JoinCircleResponseDTO.CircleDTO(
                "circle_" + circle.getId(),
                circle.getName(),
                circle.getCode(),
                members
        );

        return new JoinCircleResponseDTO("Successfully joined the circle.", circleDTO);
    }

    public void removeMemberFromCircle(Long circleId, Long userId) {
        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("Circle not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        circle.getUsers().remove(user);
        circleRepository.save(circle);

        user.setCircle(null);
        userRepository.save(user);
    }

    public List<CircleMemberDTO> getMemberDTOs(Long circleId) {
        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("Circle not found"));
        return circle.getUsers().stream()
                .map(user -> new CircleMemberDTO(
                        "user_" + user.getId(),
                        user.getName(),
                        circle.getAdmin() != null && user.getId().equals(circle.getAdmin().getId())
                ))
                .collect(Collectors.toList());
    }

    public List<LocationResponseDTO> getAllMembersLatestLocations(Long circleId) {
        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("Circle not found"));
        return circle.getUsers().stream()
                .map(user -> locationRepository.findTopByAppwriteIdOrderByTimestampDesc(user.getAppwriteId())
                        .map(loc -> {
                            LocationResponseDTO dto = new LocationResponseDTO();
                            dto.setAppwriteId(loc.getAppwriteId());
                            dto.setUsername(user.getName());
                            dto.setLatitude(loc.getLatitude());
                            dto.setLongitude(loc.getLongitude());
                            dto.setAddress(loc.getAddress());
                            dto.setStatusMessage(loc.getStatusMessage());
                            dto.setAccuracy(loc.getAccuracy());
                            dto.setBatteryLevel(loc.getBatteryLevel());
                            dto.setTimestamp(loc.getTimestamp());
                            return dto;
                        }).orElse(null))
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }
}