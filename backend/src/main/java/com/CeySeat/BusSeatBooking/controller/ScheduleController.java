package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.dto.ScheduleResponse;
import com.CeySeat.BusSeatBooking.exception.NotFoundException;
import com.CeySeat.BusSeatBooking.model.BookingStatus;
import com.CeySeat.BusSeatBooking.model.Bus;
import com.CeySeat.BusSeatBooking.model.Schedule;
import com.CeySeat.BusSeatBooking.model.ScheduleStatus;
import com.CeySeat.BusSeatBooking.repository.BookingRepository;
import com.CeySeat.BusSeatBooking.repository.BusRepository;
import com.CeySeat.BusSeatBooking.repository.ScheduleRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Comparator;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleRepository scheduleRepository;
    private final BusRepository busRepository;
    private final BookingRepository bookingRepository;

    public ScheduleController(ScheduleRepository scheduleRepository, BusRepository busRepository,
                               BookingRepository bookingRepository) {
        this.scheduleRepository = scheduleRepository;
        this.busRepository = busRepository;
        this.bookingRepository = bookingRepository;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private ScheduleResponse toResponse(Schedule schedule) {
        Bus bus = busRepository.findById(schedule.getBusId()).orElse(null);
        int bookedCount = bookingRepository
                .findByScheduleIdAndStatusIn(schedule.getId(), List.of(BookingStatus.RESERVED, BookingStatus.PAID))
                .size();
        int totalSeats = bus != null ? bus.getTotalSeats() : 0;

        return new ScheduleResponse(
                schedule.getId(),
                schedule.getBusId(),
                schedule.getRouteId(),
                schedule.getDepartureTime(),
                schedule.getArrivalTime(),
                schedule.getFare(),
                schedule.getStatus(),
                bus != null ? bus.getTravelName() : null,
                bus != null ? bus.getBusType() : null,
                bus != null ? bus.getContactNumber() : null,
                bus != null ? bus.getModel() : null,
                totalSeats,
                Math.max(0, totalSeats - bookedCount)
        );
    }

    @GetMapping
    public List<ScheduleResponse> getSchedules(
            @RequestParam(required = false) String routeId,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {

        List<Schedule> results;

        // No filters at all → return everything (homepage "browse all" case)
        if (routeId == null && start == null && end == null) {
            results = scheduleRepository.findAll();
        } else if (routeId != null && start == null && end == null) {
            // Route only, no date range → all schedules for that route
            results = scheduleRepository.findByRouteId(routeId);
        } else if (routeId != null && start != null && end != null) {
            // Full filtered search — route + date range
            LocalDateTime startTime = LocalDateTime.parse(start);
            LocalDateTime endTime = LocalDateTime.parse(end);
            results = scheduleRepository.findByRouteIdAndDepartureTimeBetween(routeId, startTime, endTime);
        } else {
            throw new IllegalArgumentException("Provide either no filters, routeId alone, or routeId with both start and end.");
        }

        // Passengers only ever see schedules an admin has approved.
        return results.stream()
                .filter(s -> s.getStatus() == ScheduleStatus.APPROVED)
                .map(this::toResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<Schedule> addSchedule(@RequestBody Schedule schedule, java.security.Principal principal) {
        Bus bus = busRepository.findById(schedule.getBusId())
                .orElseThrow(() -> new NotFoundException("Bus not found: " + schedule.getBusId()));

        if (!bus.getOperatorId().equals(principal.getName())) {
            throw new SecurityException("You can only create schedules for your own buses.");
        }

        // New schedules always start out pending admin approval — never trust
        // a client-supplied status here.
        schedule.setStatus(ScheduleStatus.PENDING);

        return ResponseEntity.ok(scheduleRepository.save(schedule));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Schedule> updateSchedule(@PathVariable String id, @RequestBody Schedule updated,
                                                    Authentication authentication) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule not found: " + id));
        Bus bus = busRepository.findById(schedule.getBusId())
                .orElseThrow(() -> new NotFoundException("Bus not found: " + schedule.getBusId()));

        if (!bus.getOperatorId().equals(authentication.getName()) && !isAdmin(authentication)) {
            throw new SecurityException("You can only edit schedules for your own buses.");
        }

        schedule.setRouteId(updated.getRouteId());
        schedule.setDepartureTime(updated.getDepartureTime());
        schedule.setArrivalTime(updated.getArrivalTime());
        schedule.setFare(updated.getFare());
        // Any edit needs a fresh admin review before it goes back out to passengers.
        schedule.setStatus(ScheduleStatus.PENDING);

        return ResponseEntity.ok(scheduleRepository.save(schedule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable String id, Authentication authentication) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule not found: " + id));
        Bus bus = busRepository.findById(schedule.getBusId())
                .orElseThrow(() -> new NotFoundException("Bus not found: " + schedule.getBusId()));

        if (!bus.getOperatorId().equals(authentication.getName()) && !isAdmin(authentication)) {
            throw new SecurityException("You can only delete schedules for your own buses.");
        }

        scheduleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<ScheduleResponse>> getMySchedules(Principal principal) {
        List<Bus> myBuses = busRepository.findByOperatorId(principal.getName());
        List<String> myBusIds = myBuses.stream().map(Bus::getId).toList();
        List<ScheduleResponse> schedules = myBusIds.stream()
                .flatMap(busId -> scheduleRepository.findByBusId(busId).stream())
                .map(this::toResponse)
                .sorted(Comparator.comparing(ScheduleResponse::getDepartureTime))
                .toList();
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/{id}")
    public ScheduleResponse getSchedule(@PathVariable String id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule not found: " + id));
        return toResponse(schedule);
    }

}
