package com.CeySeat.BusSeatBooking.repository;

import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByScheduleIdAndStatusIn(String scheduleId, List<BookingStatus> statuses);

    List<Booking> findByGroupBookingId(String groupBookingId);

    List<Booking> findByStatusAndReservedUntilBefore(BookingStatus status, LocalDateTime cutoff);
}
