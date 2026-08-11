package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.model.Schedule;
import com.CeySeat.BusSeatBooking.repository.ScheduleRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleRepository scheduleRepository;

    public ScheduleController(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    @GetMapping
    public List<Schedule> getSchedules(
            @RequestParam(required = false) String routeId,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {

        // No filters at all → return everything (homepage "browse all" case)
        if (routeId == null && start == null && end == null) {
            return scheduleRepository.findAll();
        }

        // Route only, no date range → all schedules for that route
        if (routeId != null && start == null && end == null) {
            return scheduleRepository.findByRouteId(routeId);
        }

        // Full filtered search — route + date range
        if (routeId != null && start != null && end != null) {
            LocalDateTime startTime = LocalDateTime.parse(start);
            LocalDateTime endTime = LocalDateTime.parse(end);
            return scheduleRepository.findByRouteIdAndDepartureTimeBetween(routeId, startTime, endTime);
        }

        // Any other partial combination — treat as unsupported for now
        throw new IllegalArgumentException("Provide either no filters, routeId alone, or routeId with both start and end.");
    }

    @PostMapping
    public Schedule addSchedule(@RequestBody Schedule schedule) {
        return scheduleRepository.save(schedule);
    }
}