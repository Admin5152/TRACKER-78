package com.SpringBoot.Tracker_78.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

public class LeaveCircleRequest {

    @NotNull(message = "Circle ID is required")
    private Long circleId;

    @NotBlank(message = "Appwrite ID is required")
    private String appwriteId;

    public Long getCircleId() {
        return circleId;
    }

    public void setCircleId(Long circleId) {
        this.circleId = circleId;
    }

    public String getAppwriteId() {
        return appwriteId;
    }

    public void setAppwriteId(String appwriteId) {
        this.appwriteId = appwriteId;
    }
}