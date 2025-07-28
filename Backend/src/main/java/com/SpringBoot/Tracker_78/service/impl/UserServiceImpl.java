package com.SpringBoot.Tracker_78.service.impl;

import com.SpringBoot.Tracker_78.service.UserService;
import com.SpringBoot.Tracker_78.model.Circle;
import com.SpringBoot.Tracker_78.dto.UserDTO;
import com.SpringBoot.Tracker_78.repository.CircleRepository;
import com.SpringBoot.Tracker_78.model.User;
import com.SpringBoot.Tracker_78.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CircleRepository circleRepository;

    @Override
    public UserDTO getUserByAppwriteId(String appwriteId) {
        User user = userRepository.findByAppwriteId(appwriteId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toDTO(user);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO createUser(UserDTO userDTO) {
        User user = toEntity(userDTO);
        User savedUser = userRepository.save(user);
        return toDTO(savedUser);
    }

    @Override
    public UserDTO updateUser(String appwriteId, UserDTO userDTO) {
        User user = userRepository.findByAppwriteId(appwriteId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setProfilePicture(userDTO.getProfilePicture());
        user.setBatteryLevel(userDTO.getBatteryLevel());
        user.setSharingLocation(userDTO.isSharingLocation());
        user.setLastLocationUpdate(userDTO.getLastLocationUpdate());
        User updatedUser = userRepository.save(user);
        return toDTO(updatedUser);
    }

    @Override
    public void deleteUser(String appwriteId) {
        User user = userRepository.findByAppwriteId(appwriteId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    public void addUserToCircle(String appwriteId, Long circleId) {
        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("Circle not found"));
        User user = userRepository.findByAppwriteId(appwriteId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        circle.addMember(user);
        circleRepository.save(circle);
    }

    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setAppwriteId(user.getAppwriteId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setBatteryLevel(user.getBatteryLevel());
        dto.setSharingLocation(user.isSharingLocation());
        dto.setLastLocationUpdate(user.getLastLocationUpdate());
        return dto;
    }

    private User toEntity(UserDTO dto) {
        User user = new User();
        user.setId(dto.getId());
        user.setAppwriteId(dto.getAppwriteId());
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setProfilePicture(dto.getProfilePicture());
        user.setBatteryLevel(dto.getBatteryLevel());
        user.setSharingLocation(dto.isSharingLocation());
        user.setLastLocationUpdate(dto.getLastLocationUpdate());
        return user;
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}