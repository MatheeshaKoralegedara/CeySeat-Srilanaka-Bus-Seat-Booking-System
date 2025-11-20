package com.CeySeat.BusSeatBooking.controller;


import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.repository.BookingRepository;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository bookingRepository;

    public BookingController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/{scheduleId}/seats")
    public List<String> getBookedSeats(@PathVariable String scheduleId) {
        List<Booking> bookings = bookingRepository.findByScheduleIdAndStatusIn(scheduleId,
                Arrays.asList("reserved", "paid"));
        return bookings.stream()
                .flatMap(b -> b.getSeats().stream())
                .collect(Collectors.toList());
    }

    @PostMapping("/reserve")
    public Booking reserveSeats(@RequestBody Booking bookingRequest) {
        // check if seats are available
        List<String> bookedSeats = getBookedSeats(bookingRequest.getScheduleId());
        for (String seat : bookingRequest.getSeats()) {
            if (bookedSeats.contains(seat)) {
                throw new RuntimeException("Seat already booked: " + seat);
            }
        }

        // set reservedUntil 10 min from now
        bookingRequest.setStatus("reserved");
        bookingRequest.setReservedUntil(LocalDateTime.now().plusMinutes(10));
        return bookingRepository.save(bookingRequest);
    }

    @PostMapping("/{bookingId}/pay")
    public Booking payBooking(@PathVariable String bookingId, @RequestParam String paymentRef) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus("paid");
        booking.setPaymentReference(paymentRef);
        booking.setReservedUntil(null);
        return bookingRepository.save(booking);
    }
}
