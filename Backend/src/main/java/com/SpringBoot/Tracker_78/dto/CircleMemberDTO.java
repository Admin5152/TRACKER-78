package com.SpringBoot.Tracker_78.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "DTO representing a member of a circle")
public class CircleMemberDTO {

    @NotBlank(message = "Member ID cannot be blank")
    @Schema(description = "Unique identifier of the member", example = "u456", required = true)
    private String id;

    @NotBlank(message = "Member name cannot be blank")
    @Schema(description = "Name of the member", example = "Alice Smith", required = true)
    private String name;

    @Schema(description = "Whether the member is an admin", example = "true", required = true)
    private boolean isAdmin;

    public CircleMemberDTO() {}

    public CircleMemberDTO(String id, String name, boolean isAdmin) {
        this.id = id;
        this.name = name;
        this.isAdmin = isAdmin;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isAdmin() { return isAdmin; }
    public void setAdmin(boolean admin) { isAdmin = admin; }
}