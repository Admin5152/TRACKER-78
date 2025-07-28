package com.SpringBoot.Tracker_78.repository;

import com.SpringBoot.Tracker_78.model.Circle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CircleRepository extends JpaRepository<Circle, Long> {
    Optional<Circle> findByCode(String code);
}