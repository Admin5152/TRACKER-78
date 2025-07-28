package com.SpringBoot.Tracker_78.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

@Service
public class AppwriteFileUploadService {

    private static final Logger logger = LoggerFactory.getLogger(AppwriteFileUploadService.class);

    @Value("${appwrite.endpoint}")
    private String appwriteEndpoint;

    @Value("${appwrite.projectId}")
    private String appwriteProjectId;

    @Value("${appwrite.apiKey}")
    private String appwriteApiKey;

    private final RestTemplate restTemplate;

    public AppwriteFileUploadService() {
        this.restTemplate = new RestTemplate();
    }

    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be null or empty");
        }

        String url = appwriteEndpoint + "/v1/storage/files";

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Appwrite-Project", appwriteProjectId);
        headers.set("X-Appwrite-Key", appwriteApiKey);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        ByteArrayResource fileAsResource;
        try {
            fileAsResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
        } catch (Exception ex) {
            logger.error("Error reading file bytes", ex);
            throw new RuntimeException("Error reading file bytes", ex);
        }

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileAsResource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            if (response.getStatusCode() == HttpStatus.CREATED || response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                logger.error("Failed to upload file: {}", response.getBody());
                throw new RuntimeException("Failed to upload file: " + response.getBody());
            }
        } catch (Exception ex) {
            logger.error("Exception during file upload", ex);
            throw new RuntimeException("Exception during file upload", ex);
        }
    }
}