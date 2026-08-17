package com.CeySeat.BusSeatBooking.dto;

import com.CeySeat.BusSeatBooking.model.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class BookingResponse {
    private String id;
    private String scheduleId;
    private String groupBookingId;
    private String seatNo;
    private BookingStatus status;
    private Instant reservedUntil;
    private double fare;
    private String passengerGender;
}
