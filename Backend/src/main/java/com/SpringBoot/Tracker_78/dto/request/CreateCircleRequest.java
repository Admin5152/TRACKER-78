package com.SpringBoot.Tracker_78.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateCircleRequest {

    @NotBlank(message = "Circle name is required")
    private String name;

    @NotBlank(message = "Creator Appwrite ID is required")
    private String creatorAppwriteId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCreatorAppwriteId() {
        return creatorAppwriteId;
    }

    public void setCreatorAppwriteId(String creatorAppwriteId) {
        this.creatorAppwriteId = creatorAppwriteId;
    }
}