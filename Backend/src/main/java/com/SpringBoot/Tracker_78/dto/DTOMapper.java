package com.SpringBoot.Tracker_78.dto;

import com.SpringBoot.Tracker_78.dto.response.*;
import com.SpringBoot.Tracker_78.model.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DTOMapper {

    public UserResponseDTO toUserResponseDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getAppwriteId(),
                user.getName(),
                user.getEmail(),
                user.getProfilePicture(),
                user.getBatteryLevel(),
                user.isSharingLocation(),
                user.getLastLocationUpdate(),
                user.getCircle() != null ? user.getCircle().getId() : null
        );
    }

    public CircleResponseDTO toCircleResponseDTO(Circle circle) {
        List<CircleMemberDTO> members = circle.getUsers().stream()
                .map(user -> new CircleMemberDTO(
                        "user_" + user.getId(),
                        user.getName(),
                        circle.getAdmin() != null && user.getId().equals(circle.getAdmin().getId())
                ))
                .collect(Collectors.toList());

        CircleResponseDTO dto = new CircleResponseDTO(
                circle.getId(),
                circle.getName(),
                circle.getCode(),
                circle.getCreatorAppwriteId(),
                circle.getCreatedAt()
        );
        dto.setMembers(members);
        return dto;
    }

    public SimpleUserDTO toSimpleUserDTO(User user) {
        return new SimpleUserDTO(
                user.getId(),
                user.getAppwriteId(),
                user.getName(),
                user.getEmail(),
                user.getProfilePicture(),
                user.getBatteryLevel()
        );
    }

    public User toUserEntity(UserDTO userDTO) {
        return new User(
                userDTO.getId(),
                userDTO.getAppwriteId(),
                userDTO.getEmail(),
                userDTO.getName(),
                userDTO.getProfilePicture(),
                userDTO.getBatteryLevel()
        );
    }
}