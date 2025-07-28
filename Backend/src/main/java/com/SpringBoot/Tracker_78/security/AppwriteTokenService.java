package com.SpringBoot.Tracker_78.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.json.JSONObject;

@Service
public class AppwriteTokenService {

    @Value("${appwrite.endpoint}")
    private String appwriteEndpoint;

    private final RestTemplate restTemplate;

    public AppwriteTokenService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Verifies the token and returns the user's Appwrite ID.
     */
    public String verifyTokenAndGetUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.replace("Bearer ", "").trim();

        try {
            String url = appwriteEndpoint + "/v1/account";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("X-Appwrite-Key", token); // OR you can set it as cookie

            headers.set("X-Fallback-Cookies", "a_session_" + token); // Appwrite alternative for session token

            // Some setups prefer setting the session as cookie
            headers.set("Cookie", "a_session_" + token);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                JSONObject body = new JSONObject(response.getBody());
                return body.getString("$id"); // Appwrite returns user ID as $id
            } else {
                throw new RuntimeException("Invalid Appwrite token");
            }

        } catch (Exception e) {
            throw new RuntimeException("Token verification failed: " + e.getMessage());
        }
    }
}
