package com.SpringBoot.Tracker_78.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Data transfer object for circle operations")
public class CircleDTO {

    @Schema(description = "Unique identifier of the circle", example = "c123", required = false)
    private String id;

    @NotBlank(message = "Circle name cannot be blank")
    @Size(min = 2, max = 50, message = "Circle name must be between 2 and 50 characters")
    @Schema(description = "Name of the circle", example = "Family Group", required = true)
    private String name;

    @Schema(description = "Optional description of the circle", example = "Our family location sharing group")
    private String description;

    @Schema(description = "Circle join code", example = "FAM123", required = false)
    private String code;

    public CircleDTO() {}

    public CircleDTO(String id, String name, String description, String code) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.code = code;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}