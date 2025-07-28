package com.SpringBoot.Tracker_78.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "DTO for updating a user's location")
public class LocationUpdateDTO {

    @NotNull(message = "User ID cannot be null")
    @Schema(description = "Unique identifier of the user", example = "123", required = true)
    private Long userId;

    @NotNull(message = "Latitude cannot be null")
    @Schema(description = "Latitude coordinate", example = "37.7749", required = true)
    private Double latitude;

    @NotNull(message = "Longitude cannot be null")
    @Schema(description = "Longitude coordinate", example = "-122.4194", required = true)
    private Double longitude;

    @Schema(description = "Formatted address", example = "123 Main St, San Francisco")
    private String address;

    @Schema(description = "User's status message", example = "At work")
    private String statusMessage;
}