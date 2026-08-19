package com.CeySeat.BusSeatBooking.service;

import com.CeySeat.BusSeatBooking.dto.ResendOtpRequest;
import com.CeySeat.BusSeatBooking.dto.VerificationStatusResponse;
import com.CeySeat.BusSeatBooking.dto.VerifyOtpRequest;
import com.CeySeat.BusSeatBooking.exception.NotFoundException;
import com.CeySeat.BusSeatBooking.model.User;
import com.CeySeat.BusSeatBooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;

@Service
public class OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int MAX_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final int expiryMinutes;

    public OtpService(UserRepository userRepository, EmailService emailService,
                       @Value("${otp.expiry-minutes:10}") int expiryMinutes) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.expiryMinutes = expiryMinutes;
    }

    private String generateCode() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }

    public void sendOtp(User user) {
        String code = generateCode();
        user.setEmailOtpCode(code);
        user.setEmailOtpExpiresAt(Instant.now().plusSeconds(expiryMinutes * 60L));
        user.setEmailOtpAttempts(0);
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), code, expiryMinutes);
    }

    public void resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("No account found for this email."));
        if (user.isEmailVerified()) {
            throw new IllegalStateException("This email is already verified.");
        }
        sendOtp(user);
    }

    public VerificationStatusResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("No account found for this email."));

        if (user.getEmailOtpCode() == null || user.getEmailOtpExpiresAt() == null
                || user.getEmailOtpExpiresAt().isBefore(Instant.now())) {
            throw new IllegalStateException("This code has expired. Please request a new one.");
        }
        if (user.getEmailOtpAttempts() >= MAX_ATTEMPTS) {
            invalidateOtp(user);
            userRepository.save(user);
            throw new IllegalStateException("Too many incorrect attempts. Please request a new code.");
        }
        if (!user.getEmailOtpCode().equals(request.getCode())) {
            user.setEmailOtpAttempts(user.getEmailOtpAttempts() + 1);
            if (user.getEmailOtpAttempts() >= MAX_ATTEMPTS) {
                invalidateOtp(user);
                userRepository.save(user);
                throw new IllegalStateException("Too many incorrect attempts. Please request a new code.");
            }
            userRepository.save(user);
            throw new IllegalStateException("Incorrect verification code.");
        }

        user.setEmailVerified(true);
        invalidateOtp(user);
        User saved = userRepository.save(user);
        return new VerificationStatusResponse(saved.isEmailVerified());
    }

    private void invalidateOtp(User user) {
        user.setEmailOtpCode(null);
        user.setEmailOtpExpiresAt(null);
        user.setEmailOtpAttempts(0);
    }
}
