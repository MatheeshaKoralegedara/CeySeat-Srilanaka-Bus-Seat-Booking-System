package com.CeySeat.BusSeatBooking.scheduler;

import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.model.BookingStatus;
import com.CeySeat.BusSeatBooking.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class ReservationExpiryJob {

    private static final Logger log = LoggerFactory.getLogger(ReservationExpiryJob.class);

    private final BookingRepository bookingRepository;

    public ReservationExpiryJob(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // Runs every 60 seconds. Anything past its 10-minute hold gets released,
    // which frees the seat for the unique index (see Booking) to allow a
    // new reservation.
    @Scheduled(fixedRate = 60_000)
    public void expireStaleReservations() {
        List<Booking> expired = bookingRepository
                .findByStatusAndReservedUntilBefore(BookingStatus.RESERVED, Instant.now());

        if (expired.isEmpty()) return;

        expired.forEach(b -> b.setStatus(BookingStatus.EXPIRED));
        bookingRepository.saveAll(expired);
        log.info("Expired {} stale seat reservation(s)", expired.size());
    }
}
