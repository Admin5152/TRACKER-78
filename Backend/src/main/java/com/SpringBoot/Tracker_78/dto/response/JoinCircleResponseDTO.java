package com.SpringBoot.Tracker_78.dto.response;

import com.SpringBoot.Tracker_78.dto.CircleMemberDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class JoinCircleResponseDTO {

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Circle is required")
    private CircleDTO circle;

    public JoinCircleResponseDTO(String message, CircleDTO circle) {
        this.message = message;
        this.circle = circle;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public CircleDTO getCircle() { return circle; }
    public void setCircle(CircleDTO circle) { this.circle = circle; }

    public static class CircleDTO {

        @NotBlank(message = "Circle ID is required")
        private String id;

        @NotBlank(message = "Circle name is required")
        private String name;

        @NotBlank(message = "Circle code is required")
        private String code;

        @NotNull(message = "Members list is required")
        private List<CircleMemberDTO> members;

        public CircleDTO(String id, String name, String code, List<CircleMemberDTO> members) {
            this.id = id;
            this.name = name;
            this.code = code;
            this.members = members;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public List<CircleMemberDTO> getMembers() { return members; }
        public void setMembers(List<CircleMemberDTO> members) { this.members = members; }
    }
}