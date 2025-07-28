package com.SpringBoot.Tracker_78.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/status")
    public ResponseEntity<?> status() {
        return ResponseEntity.ok("Authenticated via Appwrite");
    }
}