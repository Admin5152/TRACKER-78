package com.SpringBoot.Tracker_78.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

public class UpdateCircleRequest {

    @NotNull(message = "Circle ID is required")
    private Long circleId;

    @NotBlank(message = "New name is required")
    private String newName;

    @NotBlank(message = "Appwrite ID is required")
    private String appwriteId;

    public Long getCircleId() {
        return circleId;
    }

    public void setCircleId(Long circleId) {
        this.circleId = circleId;
    }

    public String getNewName() {
        return newName;
    }

    public void setNewName(String newName) {
        this.newName = newName;
    }

    public String getAppwriteId() {
        return appwriteId;
    }

    public void setAppwriteId(String appwriteId) {
        this.appwriteId = appwriteId;
    }
}