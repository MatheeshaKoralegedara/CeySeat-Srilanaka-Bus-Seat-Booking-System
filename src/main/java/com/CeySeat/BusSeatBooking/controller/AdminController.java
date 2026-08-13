package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.dto.BusResponse;
import com.CeySeat.BusSeatBooking.dto.ScheduleResponse;
import com.CeySeat.BusSeatBooking.exception.NotFoundException;
import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.model.Bus;
import com.CeySeat.BusSeatBooking.model.BookingStatus;
import com.CeySeat.BusSeatBooking.model.Role;
import com.CeySeat.BusSeatBooking.model.Schedule;
import com.CeySeat.BusSeatBooking.model.ScheduleStatus;
import com.CeySeat.BusSeatBooking.model.User;
import com.CeySeat.BusSeatBooking.repository.BookingRepository;
import com.CeySeat.BusSeatBooking.repository.BusRepository;
import com.CeySeat.BusSeatBooking.repository.ScheduleRepository;
import com.CeySeat.BusSeatBooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final BusRepository busRepository;

    private ScheduleResponse toScheduleResponse(Schedule schedule) {
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

    private BusResponse toBusResponse(Bus bus) {
        User operator = userRepository.findById(bus.getOperatorId()).orElse(null);
        return new BusResponse(
                bus.getId(),
                bus.getOperatorId(),
                operator != null ? operator.getFullName() : "Unknown operator",
                operator != null ? operator.getEmail() : null,
                bus.getRegistrationNo(),
                bus.getModel(),
                bus.getTotalSeats(),
                bus.getSeatLayout(),
                bus.getLayoutType(),
                bus.getTravelName(),
                bus.getBusType(),
                bus.getContactNumber()
        );
    }

    @GetMapping("/buses")
    public List<BusResponse> getAllBuses() {
        return busRepository.findAll().stream()
                .map(this::toBusResponse)
                .toList();
    }

    @GetMapping("/schedules")
    public List<ScheduleResponse> getAllSchedules() {
        return scheduleRepository.findAll().stream()
                .map(this::toScheduleResponse)
                .sorted(Comparator.comparing(ScheduleResponse::getDepartureTime))
                .toList();
    }

    @PutMapping("/schedules/{id}/status")
    public ResponseEntity<ScheduleResponse> updateScheduleStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule not found: " + id));
        schedule.setStatus(ScheduleStatus.valueOf(body.get("status")));
        return ResponseEntity.ok(toScheduleResponse(scheduleRepository.save(schedule)));
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/users/{userId}/role")
    public User updateRole(@PathVariable String userId, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        user.setRole(Role.valueOf(body.get("role")));
        return userRepository.save(user);
    }

    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        long totalUsers = userRepository.count();
        long totalBookings = bookingRepository.count();
        long paidBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus().name().equals("PAID"))
                .count();
        double totalRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus().name().equals("PAID"))
                .mapToDouble(Booking::getFare)
                .sum();

        return Map.of(
                "totalUsers", totalUsers,
                "totalBookings", totalBookings,
                "paidBookings", paidBookings,
                "totalRevenue", totalRevenue
        );
    }
}