package com.SpringBoot.Tracker_78.repository;


import com.SpringBoot.Tracker_78.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    // Add these methods to LocationRepository
    Optional<Location> findTopByAppwriteIdOrderByTimestampDesc(String appwriteId);
    List<Location> findByCircle_Id(Long id);
    List<Location> findByAppwriteId(String appwriteId);
}