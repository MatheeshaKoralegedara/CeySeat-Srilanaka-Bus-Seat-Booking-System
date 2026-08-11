package com.CeySeat.BusSeatBooking.repository;

import com.CeySeat.BusSeatBooking.model.Schedule;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleRepository extends MongoRepository<Schedule, String> {
    List<Schedule> findByRouteId(String routeId);
    List<Schedule> findByRouteIdAndDepartureTimeBetween(String routeId, LocalDateTime start, LocalDateTime end);
}
