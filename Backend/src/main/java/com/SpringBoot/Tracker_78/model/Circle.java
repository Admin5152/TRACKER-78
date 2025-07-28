package com.SpringBoot.Tracker_78.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import java.util.Objects;

@Entity
@Schema(description = "Entity representing a user circle/group")
public class Circle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier of the circle", example = "1")
    private Long id;

    @NotBlank(message = "Circle name cannot be blank")
    @Column(nullable = false, unique = true)
    @Schema(description = "Name of the circle", example = "Family", required = true)
    private String name;

    @NotBlank(message = "Circle code cannot be blank")
    @Column(nullable = false, unique = true)
    @Schema(description = "Unique code for joining the circle", example = "FAM123", required = true)
    private String code;

    @NotBlank(message = "Creator Appwrite ID cannot be blank")
    @Column(nullable = false)
    @Schema(description = "Appwrite ID of the circle creator", example = "user123", required = true)
    private String creatorAppwriteId;

    @NotNull(message = "CreatedAt cannot be null")
    @Column(nullable = false)
    @Schema(description = "Timestamp when the circle was created", example = "2024-06-10T14:30:00", required = true)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @Schema(description = "Admin user of the circle")
    private User admin;

    @ManyToMany
    @JoinTable(
            name = "circle_members",
            joinColumns = @JoinColumn(name = "circle_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Schema(description = "Users who are members of the circle")
    private Set<User> users = new HashSet<>();

    @Transient
    @Schema(description = "User IDs received from frontend (not persisted)")
    private List<String> usersFromRequest;

    public Circle() {}

    public Circle(Long id, String name, String code, String creatorAppwriteId, LocalDateTime createdAt, Set<User> users) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.creatorAppwriteId = creatorAppwriteId;
        this.createdAt = createdAt;
        this.users = users;
    }

    public void addMember(User user) {
        this.users.add(user);
    }

    // Getters and setters
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

    public Set<User> getUsers() { return users; }
    public void setUsers(Set<User> users) { this.users = users; }

    public List<String> getUsersFromRequest() { return usersFromRequest; }
    public void setUsersFromRequest(List<String> usersFromRequest) { this.usersFromRequest = usersFromRequest; }

    public User getAdmin() { return admin; }
    public void setAdmin(User admin) { this.admin = admin; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Circle)) return false;
        Circle circle = (Circle) o;
        return Objects.equals(id, circle.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}