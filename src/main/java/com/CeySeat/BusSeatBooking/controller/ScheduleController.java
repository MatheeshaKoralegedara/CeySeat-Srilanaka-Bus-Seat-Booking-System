package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.exception.NotFoundException;
import com.CeySeat.BusSeatBooking.model.Bus;
import com.CeySeat.BusSeatBooking.model.Schedule;
import com.CeySeat.BusSeatBooking.repository.BusRepository;
import com.CeySeat.BusSeatBooking.repository.ScheduleRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleRepository scheduleRepository;
    private final BusRepository busRepository;

    public ScheduleController(ScheduleRepository scheduleRepository, BusRepository busRepository) {
        this.scheduleRepository = scheduleRepository;
        this.busRepository = busRepository;
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
    public ResponseEntity<Schedule> addSchedule(@RequestBody Schedule schedule, java.security.Principal principal) {
        Bus bus = busRepository.findById(schedule.getBusId())
                .orElseThrow(() -> new NotFoundException("Bus not found: " + schedule.getBusId()));

        if (!bus.getOperatorId().equals(principal.getName())) {
            throw new SecurityException("You can only create schedules for your own buses.");
        }

        return ResponseEntity.ok(scheduleRepository.save(schedule));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Schedule>> getMySchedules(java.security.Principal principal) {
        List<Bus> myBuses = busRepository.findByOperatorId(principal.getName());
        List<String> myBusIds = myBuses.stream().map(Bus::getId).toList();
        List<Schedule> schedules = myBusIds.stream()
                .flatMap(busId -> scheduleRepository.findByBusId(busId).stream())
                .toList();
        return ResponseEntity.ok(schedules);
    }
}
