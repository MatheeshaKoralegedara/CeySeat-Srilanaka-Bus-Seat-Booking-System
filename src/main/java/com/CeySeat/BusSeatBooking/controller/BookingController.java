package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.service.BookingService;
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
    public List<String> getBookedSeats(@PathVariable String scheduleId) {
        return bookingService.getBookedSeats(scheduleId);
    }

    @PostMapping("/reserve")
    public Booking reserveSeats(@RequestBody Booking bookingRequest) {
        return bookingService.reserveSeats(bookingRequest);
    }

    @PostMapping("/{bookingId}/pay")
    public Booking payBooking(@PathVariable String bookingId, @RequestParam String paymentRef) {
        return bookingService.payBooking(bookingId, paymentRef);
    }
}
