package com.SpringBoot.Tracker_78.security;

import com.SpringBoot.Tracker_78.model.User;
import com.SpringBoot.Tracker_78.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String appwriteId) throws UsernameNotFoundException {
        User user = userRepository.findByAppwriteId(appwriteId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new org.springframework.security.core.userdetails.User(
                user.getAppwriteId(), "", new ArrayList<>());
    }
}