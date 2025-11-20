package com.CeySeat.BusSeatBooking.repository;


import com.CeySeat.BusSeatBooking.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByScheduleIdAndStatusIn(String scheduleId, List<String> statuses);
}

