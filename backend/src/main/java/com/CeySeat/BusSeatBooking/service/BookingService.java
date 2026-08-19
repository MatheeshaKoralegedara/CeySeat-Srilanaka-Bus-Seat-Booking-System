package com.CeySeat.BusSeatBooking.service;

import com.CeySeat.BusSeatBooking.dto.BookingResponse;
import com.CeySeat.BusSeatBooking.dto.ReserveSeatsRequest;
import com.CeySeat.BusSeatBooking.exception.NotFoundException;
import com.CeySeat.BusSeatBooking.exception.SeatUnavailableException;
import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.model.BookingStatus;
import com.CeySeat.BusSeatBooking.model.Bus;
import com.CeySeat.BusSeatBooking.model.Schedule;
import com.CeySeat.BusSeatBooking.model.Seat;
import com.CeySeat.BusSeatBooking.model.ScheduleStatus;
import com.CeySeat.BusSeatBooking.model.User;
import com.CeySeat.BusSeatBooking.repository.BookingRepository;
import com.CeySeat.BusSeatBooking.repository.BusRepository;
import com.CeySeat.BusSeatBooking.repository.ScheduleRepository;
import com.CeySeat.BusSeatBooking.repository.UserRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final int HOLD_MINUTES = 20;
    private static final int MAX_SEATS_PER_BOOKING = 6;
    private static final Set<String> VALID_GENDERS = Set.of("MALE", "FEMALE");

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final BusRepository busRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository, ScheduleRepository scheduleRepository,
                           BusRepository busRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.scheduleRepository = scheduleRepository;
        this.busRepository = busRepository;
        this.userRepository = userRepository;
    }

    public List<BookingResponse> reserveSeats(ReserveSeatsRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
        if (!user.isEmailVerified()) {
            throw new IllegalStateException("Please verify your email address before booking a seat.");
        }

        if (request.getSeatNumbers().size() > MAX_SEATS_PER_BOOKING) {
            throw new SeatUnavailableException("You can reserve at most " + MAX_SEATS_PER_BOOKING + " seats per booking.");
        }

        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new NotFoundException("Schedule not found: " + request.getScheduleId()));

        if (schedule.getStatus() != ScheduleStatus.APPROVED) {
            throw new SeatUnavailableException("This schedule is not currently open for booking.");
        }

        if (!schedule.getDepartureTime().isAfter(LocalDateTime.now())) {
            throw new SeatUnavailableException("This bus has already departed.");
        }

        Bus bus = busRepository.findById(schedule.getBusId())
                .orElseThrow(() -> new NotFoundException("Bus not found: " + schedule.getBusId()));

        Set<String> validSeatNumbers = bus.getSeatLayout() == null ? Set.of() : bus.getSeatLayout().stream()
                .filter(Seat::isBookable)
                .map(Seat::getSeatNo)
                .collect(Collectors.toSet());

        for (String seatNo : request.getSeatNumbers()) {
            if (!validSeatNumbers.contains(seatNo)) {
                throw new SeatUnavailableException("Seat " + seatNo + " does not exist on this bus.");
            }
        }

        String groupId = UUID.randomUUID().toString();
        List<Booking> saved = new ArrayList<>();

        // Insert one Booking per seat. The unique compound index on
        // (scheduleId, seatNo) for RESERVED/PAID bookings means MongoDB
        // itself rejects a duplicate seat - no read-then-write race window.
        for (String seatNo : request.getSeatNumbers()) {
            String gender = request.getPassengerGenders().get(seatNo);
            if (gender == null || gender.isBlank()) {
                // IllegalArgumentException is reserved for auth (401 handler) elsewhere in
                // this app, so a plain validation failure here maps to 409 instead of 400 —
                // acceptable since this only triggers on a malformed request, never real usage.
                throw new IllegalStateException("Missing passenger gender for seat " + seatNo);
            }
            if (!VALID_GENDERS.contains(gender)) {
                throw new IllegalStateException("Invalid passenger gender for seat " + seatNo + ": " + gender);
            }

            Booking booking = new Booking();
            booking.setScheduleId(request.getScheduleId());
            booking.setUserId(userId);
            booking.setSeatNo(seatNo);
            booking.setGroupBookingId(groupId);
            booking.setStatus(BookingStatus.RESERVED);
            booking.setReservedUntil(Instant.now().plusSeconds(HOLD_MINUTES * 60L));
            booking.setFare(schedule.getFare());
            booking.setPassengerGender(gender);

            try {
                saved.add(bookingRepository.save(booking));
            } catch (DuplicateKeyException e) {
                // Roll back any seats already reserved in this request so a
                // partial failure doesn't leave orphaned holds.
                bookingRepository.deleteAll(saved);
                throw new SeatUnavailableException("Seat " + seatNo + " is already taken.");
            }
        }

        return toResponses(saved);
    }

    public List<BookingResponse> cancelBooking(String groupBookingId, String requestingUserId) {
        List<Booking> bookings = bookingRepository.findByGroupBookingId(groupBookingId);
        if (bookings.isEmpty()) {
            throw new NotFoundException("Booking not found: " + groupBookingId);
        }

        for (Booking booking : bookings) {
            if (!booking.getUserId().equals(requestingUserId)) {
                throw new SecurityException("You do not own this booking.");
            }
            if (booking.getStatus() != BookingStatus.RESERVED) {
                throw new SeatUnavailableException("Only reserved bookings can be cancelled.");
            }
        }

        bookings.forEach(b -> b.setStatus(BookingStatus.CANCELLED));
        return toResponses(bookingRepository.saveAll(bookings));
    }

    public List<BookingResponse> getBookedSeats(String scheduleId) {
        return toResponses(bookingRepository
                .findByScheduleIdAndStatusIn(scheduleId, List.of(BookingStatus.RESERVED, BookingStatus.PAID)));
    }

    // Batches the Schedule/Bus lookups (one query each, not per booking) so a
    // multi-seat group or a passenger's whole history doesn't turn into an N+1.
    private List<BookingResponse> toResponses(List<Booking> bookings) {
        Set<String> scheduleIds = bookings.stream().map(Booking::getScheduleId).collect(Collectors.toSet());
        Map<String, Schedule> schedulesById = scheduleRepository.findAllById(scheduleIds).stream()
                .collect(Collectors.toMap(Schedule::getId, s -> s));

        Set<String> busIds = schedulesById.values().stream().map(Schedule::getBusId).collect(Collectors.toSet());
        Map<String, Bus> busesById = busRepository.findAllById(busIds).stream()
                .collect(Collectors.toMap(Bus::getId, b -> b));

        return bookings.stream().map(b -> {
            Schedule schedule = schedulesById.get(b.getScheduleId());
            Bus bus = schedule != null ? busesById.get(schedule.getBusId()) : null;
            return new BookingResponse(b.getId(), b.getScheduleId(), b.getGroupBookingId(), b.getSeatNo(),
                    b.getStatus(), b.getReservedUntil(), b.getFare(), b.getPassengerGender(),
                    schedule != null ? schedule.getRouteId() : null,
                    schedule != null ? schedule.getDepartureTime() : null,
                    schedule != null ? schedule.getArrivalTime() : null,
                    bus != null ? bus.getTravelName() : null,
                    bus != null ? bus.getModel() : null,
                    bus != null ? bus.getRegistrationNo() : null,
                    bus != null ? bus.getContactNumber() : null);
        }).collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingGroup(String groupBookingId, String requestingUserId) {
        List<Booking> bookings = bookingRepository.findByGroupBookingId(groupBookingId);
        if (bookings.isEmpty()) {
            throw new NotFoundException("Booking not found: " + groupBookingId);
        }
        boolean ownedByCaller = bookings.stream().allMatch(b -> b.getUserId().equals(requestingUserId));
        if (!ownedByCaller) {
            throw new SecurityException("You do not own this booking.");
        }
        return toResponses(bookings);
    }

    public List<BookingResponse> getMyBookings(String userId) {
        return toResponses(bookingRepository.findByUserIdOrderByReservedUntilDesc(userId));
    }
}
