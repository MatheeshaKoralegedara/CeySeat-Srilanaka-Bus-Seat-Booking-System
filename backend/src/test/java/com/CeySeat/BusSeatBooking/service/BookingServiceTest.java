package com.CeySeat.BusSeatBooking.service;

import com.CeySeat.BusSeatBooking.dto.ReserveSeatsRequest;
import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.model.Bus;
import com.CeySeat.BusSeatBooking.model.Schedule;
import com.CeySeat.BusSeatBooking.model.ScheduleStatus;
import com.CeySeat.BusSeatBooking.model.Seat;
import com.CeySeat.BusSeatBooking.model.User;
import com.CeySeat.BusSeatBooking.repository.BookingRepository;
import com.CeySeat.BusSeatBooking.repository.BusRepository;
import com.CeySeat.BusSeatBooking.repository.ScheduleRepository;
import com.CeySeat.BusSeatBooking.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private BusRepository busRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    @Test
    void reserveSeatsUsesAuthenticatedUserId() {
        ReserveSeatsRequest request = new ReserveSeatsRequest();
        request.setScheduleId("schedule-1");
        request.setSeatNumbers(List.of("A1"));
        request.setPassengerGenders(Map.of("A1", "MALE"));

        User user = new User();
        user.setId("user-1");
        user.setEmailVerified(true);
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        Schedule schedule = new Schedule();
        schedule.setBusId("bus-1");
        schedule.setFare(42.5);
        schedule.setStatus(ScheduleStatus.APPROVED);
        schedule.setDepartureTime(LocalDateTime.now().plusHours(2));

        Seat seat = new Seat();
        seat.setSeatNo("A1");
        seat.setBookable(true);
        Bus bus = new Bus();
        bus.setSeatLayout(List.of(seat));

        when(scheduleRepository.findById("schedule-1")).thenReturn(Optional.of(schedule));
        when(busRepository.findById("bus-1")).thenReturn(Optional.of(bus));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId("booking-1");
            return booking;
        });

        var responses = bookingService.reserveSeats(request, "user-1");

        assertEquals(1, responses.size());
        assertEquals("booking-1", responses.get(0).getId());
        assertEquals("schedule-1", responses.get(0).getScheduleId());
    }
}