package com.SpringBoot.Tracker_78.dto.response;

import com.SpringBoot.Tracker_78.dto.CircleMemberDTO;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

public class CircleResponseDTO {

    @NotNull(message = "Circle ID is required")
    private Long id;

    @NotBlank(message = "Circle name is required")
    private String name;

    @NotBlank(message = "Circle code is required")
    private String code;

    @NotBlank(message = "Creator Appwrite ID is required")
    private String creatorAppwriteId;

    @NotNull(message = "CreatedAt is required")
    private LocalDateTime createdAt;

    private String inviteLink;

    private List<CircleMemberDTO> members;

    public CircleResponseDTO() {}

    public CircleResponseDTO(Long id, String name, String code, String creatorAppwriteId, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.creatorAppwriteId = creatorAppwriteId;
        this.createdAt = createdAt;
    }

    public CircleResponseDTO(Long id, String name, String code, String creatorAppwriteId, LocalDateTime createdAt, List<CircleMemberDTO> members) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.creatorAppwriteId = creatorAppwriteId;
        this.createdAt = createdAt;
        this.members = members;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCreatorAppwriteId() { return creatorAppwriteId; }
    public void setCreatorAppwriteId(String creatorAppwriteId) { this.creatorAppwriteId = creatorAppwriteId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getInviteLink() { return inviteLink; }
    public void setInviteLink(String inviteLink) { this.inviteLink = inviteLink; }

    public List<CircleMemberDTO> getMembers() { return members; }
    public void setMembers(List<CircleMemberDTO> members) { this.members = members; }
}