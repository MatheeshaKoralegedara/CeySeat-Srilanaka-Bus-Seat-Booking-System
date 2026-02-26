package com.CeySeat.BusSeatBooking.service;

import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public List<String> getBookedSeats(String scheduleId) {
        List<Booking> bookings = bookingRepository.findByScheduleIdAndStatusIn(scheduleId,
                Arrays.asList("reserved", "paid"));
        return bookings.stream()
                .flatMap(b -> b.getSeats().stream())
                .collect(Collectors.toList());
    }

    public Booking reserveSeats(Booking bookingRequest) {
        List<String> bookedSeats = getBookedSeats(bookingRequest.getScheduleId());
        for (String seat : bookingRequest.getSeats()) {
            if (bookedSeats.contains(seat)) {
                throw new RuntimeException("Seat already booked: " + seat);
            }
        }

        bookingRequest.setStatus("reserved");
        bookingRequest.setReservedUntil(LocalDateTime.now().plusMinutes(10));
        return bookingRepository.save(bookingRequest);
    }

    public Booking payBooking(String bookingId, String paymentRef) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus("paid");
        booking.setPaymentReference(paymentRef);
        booking.setReservedUntil(null);
        return bookingRepository.save(booking);
    }
}
