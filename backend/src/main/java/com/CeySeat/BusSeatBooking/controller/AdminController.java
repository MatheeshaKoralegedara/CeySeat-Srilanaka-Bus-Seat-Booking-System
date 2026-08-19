package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.dto.BusResponse;
import com.CeySeat.BusSeatBooking.dto.ScheduleResponse;
import com.CeySeat.BusSeatBooking.exception.NotFoundException;
import com.CeySeat.BusSeatBooking.model.AdminAuditLog;
import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.model.Bus;
import com.CeySeat.BusSeatBooking.model.BookingStatus;
import com.CeySeat.BusSeatBooking.model.Role;
import com.CeySeat.BusSeatBooking.model.Schedule;
import com.CeySeat.BusSeatBooking.model.ScheduleStatus;
import com.CeySeat.BusSeatBooking.model.User;
import com.CeySeat.BusSeatBooking.repository.AdminAuditLogRepository;
import com.CeySeat.BusSeatBooking.repository.BookingRepository;
import com.CeySeat.BusSeatBooking.repository.BusRepository;
import com.CeySeat.BusSeatBooking.repository.ScheduleRepository;
import com.CeySeat.BusSeatBooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
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
    private final AdminAuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    private void recordAudit(Authentication authentication, String action, String targetType, String targetId, String details) {
        User admin = userRepository.findById(authentication.getName()).orElse(null);

        AdminAuditLog log = new AdminAuditLog();
        log.setAdminId(authentication.getName());
        log.setAdminEmail(admin != null ? admin.getEmail() : null);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetails(details);
        log.setTimestamp(Instant.now());
        auditLogRepository.save(log);
    }

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
    public ResponseEntity<ScheduleResponse> updateScheduleStatus(@PathVariable String id, @RequestBody Map<String, String> body, Authentication authentication) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule not found: " + id));
        ScheduleStatus previousStatus = schedule.getStatus();
        schedule.setStatus(ScheduleStatus.valueOf(body.get("status")));
        Schedule saved = scheduleRepository.save(schedule);
        recordAudit(authentication, "UPDATE_SCHEDULE_STATUS", "Schedule", id,
                previousStatus + " -> " + saved.getStatus());
        return ResponseEntity.ok(toScheduleResponse(saved));
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody Map<String, String> body, Authentication authentication) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("Email is required.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("An account with this email already exists.");
        }
        String password = body.get("password");
        if (password == null || password.length() < 8) {
            throw new IllegalStateException("Password must be at least 8 characters long.");
        }

        User user = new User();
        user.setFullName(body.get("fullName"));
        user.setEmail(email);
        user.setPhone(body.get("phone"));
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(body.get("role") != null ? Role.valueOf(body.get("role")) : Role.USER);

        User saved = userRepository.save(user);
        recordAudit(authentication, "CREATE_USER", "User", saved.getId(),
                "email=" + saved.getEmail() + ", role=" + saved.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/users/{userId}/role")
    public User updateRole(@PathVariable String userId, @RequestBody Map<String, String> body, Authentication authentication) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        Role previousRole = user.getRole();
        user.setRole(Role.valueOf(body.get("role")));
        User saved = userRepository.save(user);
        recordAudit(authentication, "UPDATE_USER_ROLE", "User", userId,
                previousRole + " -> " + saved.getRole());
        return saved;
    }

    @GetMapping("/audit-logs")
    public List<AdminAuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
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