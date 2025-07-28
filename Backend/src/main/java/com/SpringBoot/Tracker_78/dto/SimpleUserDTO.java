package com.SpringBoot.Tracker_78.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO representing a simplified user profile")
public class SimpleUserDTO {

    @NotNull(message = "User ID cannot be null")
    @Schema(description = "Unique identifier of the user", example = "123", required = true)
    private Long id;

    @NotBlank(message = "Name cannot be blank")
    @Schema(description = "User's name", example = "Alice Smith", required = true)
    private String name;

    @NotBlank(message = "Email cannot be blank")
    @Schema(description = "User's email address", example = "alice@example.com", required = true)
    private String email;

    @Schema(description = "User's phone number", example = "+1234567890")
    private String phone;

    @Schema(description = "URL to user's profile picture", example = "https://example.com/profile.jpg")
    private String profilePicture;

    @Schema(description = "User's battery level", example = "85")
    private Integer batteryLevel;
}