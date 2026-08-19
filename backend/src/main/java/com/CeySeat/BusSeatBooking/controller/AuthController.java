package com.CeySeat.BusSeatBooking.controller;


import com.CeySeat.BusSeatBooking.dto.AuthResponse;
import com.CeySeat.BusSeatBooking.dto.LoginRequest;
import com.CeySeat.BusSeatBooking.dto.RegisterRequest;
import com.CeySeat.BusSeatBooking.dto.ResendOtpRequest;
import com.CeySeat.BusSeatBooking.dto.VerificationStatusResponse;
import com.CeySeat.BusSeatBooking.dto.VerifyOtpRequest;
import com.CeySeat.BusSeatBooking.service.AuthService;
import com.CeySeat.BusSeatBooking.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<VerificationStatusResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(otpService.verifyOtp(request));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Void> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        otpService.resendOtp(request);
        return ResponseEntity.accepted().build();
    }
}