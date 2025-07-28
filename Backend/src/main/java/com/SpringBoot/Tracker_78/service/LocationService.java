package com.SpringBoot.Tracker_78.service;

import com.SpringBoot.Tracker_78.model.Location;
import com.SpringBoot.Tracker_78.model.User;
import com.SpringBoot.Tracker_78.repository.LocationRepository;
import com.SpringBoot.Tracker_78.repository.UserRepository;
import com.SpringBoot.Tracker_78.repository.CircleRepository;
import com.SpringBoot.Tracker_78.dto.request.LocationUpdateRequestDTO;
import com.SpringBoot.Tracker_78.dto.response.LocationResponseDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final CircleRepository circleRepository;

    public LocationService(LocationRepository locationRepository, UserRepository userRepository, CircleRepository circleRepository) {
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.circleRepository = circleRepository;
    }

    // Save location from DTO
    public LocationResponseDTO saveLocation(LocationUpdateRequestDTO request) {
        String appwriteId = request.getUserId().toString(); // Fixed method name
        User user = userRepository.findByAppwriteId(appwriteId).orElse(null);

        Location location = new Location();
        location.setAppwriteId(appwriteId);
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setAddress(request.getAddress());
        location.setStatusMessage(request.getStatusMessage());
        location.setTimestamp(LocalDateTime.now());
        location.setUser(user);
        location.setBatteryLevel(request.getBatteryLevel());
        location.setAccuracy(request.getAccuracy());

        Location saved = locationRepository.save(location);
        return toResponseDTO(saved, user);
    }

    public LocationResponseDTO getLatestLocation(String userId) {
        Optional<Location> opt = locationRepository.findTopByAppwriteIdOrderByTimestampDesc(userId);
        if (opt.isEmpty()) throw new IllegalArgumentException("Location not found for appwriteId: " + userId);
        Location location = opt.get();
        User user = location.getUser();
        return toResponseDTO(location, user);
    }

    public List<LocationResponseDTO> getLocationHistory(String userId, LocalDateTime from, LocalDateTime to) {
        List<Location> locations = locationRepository.findByAppwriteId(userId).stream()
                .filter(loc -> !loc.getTimestamp().isBefore(from) && !loc.getTimestamp().isAfter(to))
                .collect(Collectors.toList());
        return locations.stream()
                .map(loc -> toResponseDTO(loc, loc.getUser()))
                .collect(Collectors.toList());
    }

    public List<LocationResponseDTO> getCircleLocations(Long circleId) {
        var circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("Circle not found"));
        return circle.getUsers().stream()
                .map(user -> {
                    Optional<Location> locOpt = locationRepository.findTopByAppwriteIdOrderByTimestampDesc(user.getAppwriteId());
                    return locOpt.map(loc -> toResponseDTO(loc, user)).orElse(null);
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    private LocationResponseDTO toResponseDTO(Location location, User user) {
        LocationResponseDTO dto = new LocationResponseDTO();
        dto.setAppwriteId(location.getAppwriteId());
        dto.setUsername(user != null ? user.getName() : null);
        dto.setLatitude(location.getLatitude());
        dto.setLongitude(location.getLongitude());
        dto.setAddress(location.getAddress());
        dto.setStatusMessage(location.getStatusMessage());
        dto.setAccuracy(location.getAccuracy());
        dto.setBatteryLevel(location.getBatteryLevel());
        dto.setTimestamp(location.getTimestamp());
        return dto;
    }

    public LocationResponseDTO updateLocation(String userId, LocationUpdateRequestDTO request) {
        User user = userRepository.findById(Long.parseLong(userId)).orElse(null);
        Location location = new Location();
        location.setUser(user);
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setTimestamp(LocalDateTime.now());
        location.setAddress(request.getAddress());
        location.setStatusMessage(request.getStatusMessage());
        location.setAccuracy(request.getAccuracy());
        location.setBatteryLevel(request.getBatteryLevel());
        location.setCircle(request.getCircleId() != null ? circleRepository.findById(request.getCircleId()).orElse(null) : null);

        Location savedLocation = locationRepository.save(location);

        LocationResponseDTO response = new LocationResponseDTO();
        response.setAppwriteId(user != null ? user.getAppwriteId() : null);
        response.setUsername(user != null ? user.getName() : null);
        response.setLatitude(savedLocation.getLatitude());
        response.setLongitude(savedLocation.getLongitude());
        response.setAddress(savedLocation.getAddress());
        response.setStatusMessage(savedLocation.getStatusMessage());
        response.setAccuracy(savedLocation.getAccuracy());
        response.setBatteryLevel(savedLocation.getBatteryLevel());
        response.setTimestamp(savedLocation.getTimestamp());
        return response;
    }

    public LocationResponseDTO getCurrentLocation(String appwriteId) {
        Location location = locationRepository.findTopByAppwriteIdOrderByTimestampDesc(appwriteId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found for appwriteId: " + appwriteId));
        User user = location.getUser();
        LocationResponseDTO response = new LocationResponseDTO();
        response.setAppwriteId(location.getAppwriteId());
        response.setUsername(user != null ? user.getName() : null);
        response.setLatitude(location.getLatitude());
        response.setLongitude(location.getLongitude());
        response.setAddress(location.getAddress());
        response.setStatusMessage(location.getStatusMessage());
        response.setAccuracy(location.getAccuracy());
        response.setBatteryLevel(location.getBatteryLevel());
        response.setTimestamp(location.getTimestamp());
        return response;
    }
}