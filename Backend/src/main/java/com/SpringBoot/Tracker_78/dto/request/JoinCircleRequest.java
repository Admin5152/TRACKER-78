package com.SpringBoot.Tracker_78.dto.request;

import jakarta.validation.constraints.NotBlank;

public class JoinCircleRequest {

    @NotBlank(message = "Circle code is required")
    private String code;

    @NotBlank(message = "Appwrite ID is required")
    private String appwriteId;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getAppwriteId() {
        return appwriteId;
    }

    public void setAppwriteId(String appwriteId) {
        this.appwriteId = appwriteId;
    }
}