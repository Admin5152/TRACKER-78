package com.SpringBoot.Tracker_78.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.json.JSONArray;
import org.json.JSONObject;

@Service
public class AppwriteSyncService {

    @Value("${appwrite.endpoint}")
    private String appwriteEndpoint;

    @Value("${appwrite.projectId}")
    private String appwriteProjectId;

    @Value("${appwrite.apiKey}")
    private String appwriteApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // Example: Fetch all users from Appwrite
    public JSONArray fetchAllUsers() {
        try {
            String url = appwriteEndpoint + "/v1/users";
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Appwrite-Project", appwriteProjectId);
            headers.set("X-Appwrite-Key", appwriteApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                JSONObject json = new JSONObject(response.getBody());
                return json.optJSONArray("users");
            }
        } catch (Exception ex) {
            // Optionally log error
        }
        return new JSONArray();
    }

    // Example: Fetch a single user by ID
    public JSONObject fetchUserById(String userId) {
        try {
            String url = appwriteEndpoint + "/v1/users/" + userId;
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Appwrite-Project", appwriteProjectId);
            headers.set("X-Appwrite-Key", appwriteApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return new JSONObject(response.getBody());
            }
        } catch (Exception ex) {
            // Optionally log error
        }
        return null;
    }
}