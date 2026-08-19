package com.CeySeat.BusSeatBooking.service;

import com.CeySeat.BusSeatBooking.config.JwtService;
import com.CeySeat.BusSeatBooking.dto.AuthResponse;
import com.CeySeat.BusSeatBooking.dto.LoginRequest;
import com.CeySeat.BusSeatBooking.dto.RegisterRequest;
import com.CeySeat.BusSeatBooking.model.Role;
import com.CeySeat.BusSeatBooking.model.User;
import com.CeySeat.BusSeatBooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("An account with this email already exists.");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setNic(request.getNic());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        User saved;
        try {
            saved = userRepository.save(user);
        } catch (DuplicateKeyException e) {
            // Two concurrent registrations can both pass the existsByEmail
            // check above; the unique index on email is the real guard, but
            // its failure must still surface as an email conflict, not the
            // generic DuplicateKeyException -> "seat already booked" mapping
            // in GlobalExceptionHandler.
            throw new IllegalStateException("An account with this email already exists.");
        }
        // The verification code is advisory at signup time - booking, not
        // login, is the actual gate (see BookingService.reserveSeats) - so a
        // mail provider outage must not block account creation. The user can
        // always resend a code later from the verification screen.
        try {
            otpService.sendOtp(saved);
        } catch (Exception e) {
            log.warn("Failed to send email OTP to new user {}", saved.getId(), e);
        }

        String token = jwtService.generateToken(saved.getId(), saved.getRole().name());

        return new AuthResponse(token, saved.getId(), saved.getFullName(), saved.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getRole().name());
    }
}
