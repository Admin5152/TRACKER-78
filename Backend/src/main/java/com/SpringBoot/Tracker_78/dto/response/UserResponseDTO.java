package com.SpringBoot.Tracker_78.dto.response;

import java.time.LocalDateTime;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response containing user details")
public class UserResponseDTO {
    @NotNull
    @Schema(description = "Database ID of the user", example = "789")
    private Long id;

    @NotBlank
    @Schema(description = "Appwrite ID of the user", example = "user123")
    private String appwriteId;

    @NotBlank
    @Schema(description = "User's full name", example = "John Doe")
    private String name;

    @NotBlank
    @Email
    @Schema(description = "User's email address", example = "john@example.com")
    private String email;

    @Schema(description = "URL of user's profile picture")
    private String profilePicture;

    @Schema(description = "User's current battery level", example = "75")
    private Integer batteryLevel;

    @Schema(description = "User's current location sharing status", example = "true")
    private Boolean isSharingLocation;

    @Schema(description = "Timestamp of last location update")
    private LocalDateTime lastLocationUpdate;

    @Schema(description = "Current circle ID if in any", example = "123")
    private Long currentCircleId;
}