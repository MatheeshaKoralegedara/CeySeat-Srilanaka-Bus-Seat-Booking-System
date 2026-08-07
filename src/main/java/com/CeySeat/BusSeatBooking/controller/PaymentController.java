package com.CeySeat.BusSeatBooking.controller;


import com.CeySeat.BusSeatBooking.dto.PaymentHashRequest;
import com.CeySeat.BusSeatBooking.dto.PaymentHashResponse;
import com.CeySeat.BusSeatBooking.exception.NotFoundException;
import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.repository.BookingRepository;
import com.CeySeat.BusSeatBooking.service.PayHereService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PayHereService payHereService;
    private final BookingRepository bookingRepository;

    @PostMapping("/hash")
    public ResponseEntity<PaymentHashResponse> generateHash(@Valid @RequestBody PaymentHashRequest request,
                                                              Principal principal) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new NotFoundException("Booking not found: " + request.getBookingId()));

        // Ownership check — you can only pay for your own booking
        if (!booking.getUserId().equals(principal.getName())) {
            throw new SecurityException("You do not own this booking.");
        }

        String formattedAmount = String.format("%.2f", booking.getFare());
        String hash = payHereService.generateHash(booking.getId(), booking.getFare());

        return ResponseEntity.ok(new PaymentHashResponse(
                payHereService.getMerchantId(),
                booking.getId(),
                formattedAmount,
                "LKR",
                hash
        ));
    }
}
