package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.dto.PaymentHashRequest;
import com.CeySeat.BusSeatBooking.dto.PaymentHashResponse;
import com.CeySeat.BusSeatBooking.exception.NotFoundException;
import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.model.BookingStatus;
import com.CeySeat.BusSeatBooking.model.User;
import com.CeySeat.BusSeatBooking.repository.BookingRepository;
import com.CeySeat.BusSeatBooking.repository.UserRepository;
import com.CeySeat.BusSeatBooking.service.PayHereService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PayHereService payHereService;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @PostMapping("/hash")
    public ResponseEntity<PaymentHashResponse> generateHash(@Valid @RequestBody PaymentHashRequest request,
                                                              Principal principal) {
        List<Booking> bookings = bookingRepository.findByGroupBookingId(request.getGroupBookingId());

        if (bookings.isEmpty()) {
            throw new NotFoundException("Booking not found: " + request.getGroupBookingId());
        }

        boolean allOwnedByCaller = bookings.stream().allMatch(b -> b.getUserId().equals(principal.getName()));
        if (!allOwnedByCaller) {
            throw new SecurityException("You do not own this booking.");
        }

        boolean allReserved = bookings.stream().allMatch(b -> b.getStatus() == BookingStatus.RESERVED);
        if (!allReserved) {
            throw new IllegalStateException("This reservation is no longer payable — it may have expired or already been paid.");
        }

        User user = userRepository.findById(principal.getName())
                .orElseThrow(() -> new NotFoundException("User not found: " + principal.getName()));

        double total = bookings.stream().mapToDouble(Booking::getFare).sum();
        String formattedAmount = String.format("%.2f", total);
        String hash = payHereService.generateHash(request.getGroupBookingId(), total);

        List<String> seatNumbers = bookings.stream().map(Booking::getSeatNo).collect(Collectors.toList());

        return ResponseEntity.ok(new PaymentHashResponse(
                payHereService.getMerchantId(),
                request.getGroupBookingId(),
                formattedAmount,
                "LKR",
                hash,
                payHereService.getNotifyUrl(),
                seatNumbers,
                bookings.get(0).getReservedUntil(),
                user.getEmail(),
                user.getPhone()
        ));
    }
}