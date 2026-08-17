package com.CeySeat.BusSeatBooking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "bookings")
@CompoundIndexes({
    // Enforces one active (RESERVED/PAID) booking per seat per schedule at
    // the database level, so two concurrent reservation requests for the
    // same seat can't both succeed - the second insert is rejected by Mongo
    // instead of relying on a read-then-write check in application code.
    @CompoundIndex(name = "schedule_seat_unique", def = "{'scheduleId': 1, 'seatNo': 1}", unique = true,
        partialFilter = "{ 'status': { '$in': ['RESERVED', 'PAID'] } }")
})
public class Booking {
    @Id
    private String id;

    @Indexed
    private String scheduleId;

    private String userId;

    // One seat per Booking document - see schedule_seat_unique index above.
    // groupBookingId ties multiple seat-Bookings together when a user buys
    // several seats in one request.
    private String seatNo;
    private String groupBookingId;

    private BookingStatus status;

    private Instant reservedUntil; // hold expiry, only relevant while status=RESERVED
    private String paymentReference;
    private double fare;
    private String passengerGender;
}
