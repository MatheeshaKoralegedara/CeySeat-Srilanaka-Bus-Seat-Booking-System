package com.CeySeat.BusSeatBooking.service;

import com.CeySeat.BusSeatBooking.dto.BookingResponse;
import com.CeySeat.BusSeatBooking.dto.ReserveSeatsRequest;
import com.CeySeat.BusSeatBooking.exception.NotFoundException;
import com.CeySeat.BusSeatBooking.exception.SeatUnavailableException;
import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.model.BookingStatus;
import com.CeySeat.BusSeatBooking.model.Schedule;
import com.CeySeat.BusSeatBooking.repository.BookingRepository;
import com.CeySeat.BusSeatBooking.repository.ScheduleRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final int HOLD_MINUTES = 20;

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;

    public BookingService(BookingRepository bookingRepository, ScheduleRepository scheduleRepository) {
        this.bookingRepository = bookingRepository;
        this.scheduleRepository = scheduleRepository;
    }

    public List<BookingResponse> reserveSeats(ReserveSeatsRequest request, String userId) {
        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new NotFoundException("Schedule not found: " + request.getScheduleId()));

        String groupId = UUID.randomUUID().toString();
        List<Booking> saved = new ArrayList<>();

        // Insert one Booking per seat. The unique compound index on
        // (scheduleId, seatNo) for RESERVED/PAID bookings means MongoDB
        // itself rejects a duplicate seat - no read-then-write race window.
        for (String seatNo : request.getSeatNumbers()) {
            Booking booking = new Booking();
            booking.setScheduleId(request.getScheduleId());
            booking.setUserId(userId);
            booking.setSeatNo(seatNo);
            booking.setGroupBookingId(groupId);
            booking.setStatus(BookingStatus.RESERVED);
            booking.setReservedUntil(LocalDateTime.now().plusMinutes(HOLD_MINUTES));
            booking.setFare(schedule.getFare());
            booking.setPassengerGender(request.getPassengerGender());

            try {
                saved.add(bookingRepository.save(booking));
            } catch (DuplicateKeyException e) {
                // Roll back any seats already reserved in this request so a
                // partial failure doesn't leave orphaned holds.
                bookingRepository.deleteAll(saved);
                throw new SeatUnavailableException("Seat " + seatNo + " is already taken.");
            }
        }

        return saved.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BookingResponse payBooking(String bookingId, String paymentRef, String requestingUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));

        if (!booking.getUserId().equals(requestingUserId)) {
            throw new SecurityException("You do not own this booking.");
        }

        if (booking.getStatus() == BookingStatus.EXPIRED) {
            throw new SeatUnavailableException("This reservation has expired. Please book again.");
        }

        booking.setStatus(BookingStatus.PAID);
        booking.setPaymentReference(paymentRef);
        return toResponse(bookingRepository.save(booking));
    }

    public List<BookingResponse> getBookedSeats(String scheduleId) {
        return bookingRepository
                .findByScheduleIdAndStatusIn(scheduleId, List.of(BookingStatus.RESERVED, BookingStatus.PAID))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private BookingResponse toResponse(Booking b) {
        return new BookingResponse(b.getId(), b.getScheduleId(), b.getSeatNo(),
                b.getStatus(), b.getReservedUntil(), b.getFare(), b.getPassengerGender());
    }

    public List<BookingResponse> getMyBookings(String userId) {
        return bookingRepository.findByUserIdOrderByReservedUntilDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }
}
