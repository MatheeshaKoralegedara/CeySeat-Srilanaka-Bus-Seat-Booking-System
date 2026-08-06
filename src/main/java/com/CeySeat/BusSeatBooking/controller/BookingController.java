package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.dto.BookingResponse;
import com.CeySeat.BusSeatBooking.dto.ReserveSeatsRequest;
import com.CeySeat.BusSeatBooking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/{scheduleId}/seats")
    public ResponseEntity<List<BookingResponse>> getBookedSeats(@PathVariable String scheduleId) {
        return ResponseEntity.ok(bookingService.getBookedSeats(scheduleId));
    }

    @PostMapping("/reserve")
    public ResponseEntity<List<BookingResponse>> reserve(@Valid @RequestBody ReserveSeatsRequest request,
                                                          java.security.Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.reserveSeats(request, principal.getName()));
    }

    @PostMapping("/{bookingId}/pay")
    public ResponseEntity<BookingResponse> pay(@PathVariable String bookingId,
                                                @RequestParam String paymentRef,
                                               java.security.Principal principal) {
        // userId as a request param is temporary until auth is added, at
        // which point this should come from the authenticated principal
        // instead of a caller-supplied value.
        return ResponseEntity.ok(bookingService.payBooking(bookingId, paymentRef, principal.getName()));
    }
}
