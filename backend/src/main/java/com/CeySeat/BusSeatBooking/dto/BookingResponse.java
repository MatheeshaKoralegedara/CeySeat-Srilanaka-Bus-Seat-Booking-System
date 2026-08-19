package com.CeySeat.BusSeatBooking.dto;

import com.CeySeat.BusSeatBooking.model.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;

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
    private String routeId;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String travelName;
    private String busModel;
    private String registrationNo;
    private String contactNumber;
}
