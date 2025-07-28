package com.SpringBoot.Tracker_78.service;

import com.SpringBoot.Tracker_78.model.User;
import com.SpringBoot.Tracker_78.dto.UserDTO;
import java.util.List;

public interface UserService {
    User findByUsername(String username);
    User findById(Long id);
    UserDTO getUserByAppwriteId(String appwriteId);
    List<UserDTO> getAllUsers();
    UserDTO createUser(UserDTO userDTO);
    UserDTO updateUser(String appwriteId, UserDTO userDTO);
    void deleteUser(String appwriteId);
}