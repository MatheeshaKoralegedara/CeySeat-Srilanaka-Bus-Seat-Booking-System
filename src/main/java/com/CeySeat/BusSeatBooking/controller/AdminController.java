package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.model.Role;
import com.CeySeat.BusSeatBooking.model.User;
import com.CeySeat.BusSeatBooking.repository.BookingRepository;
import com.CeySeat.BusSeatBooking.repository.UserRepository;
import com.CeySeat.BusSeatBooking.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

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