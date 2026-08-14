package com.CeySeat.BusSeatBooking.dto;

import com.CeySeat.BusSeatBooking.model.BusType;
import com.CeySeat.BusSeatBooking.model.ScheduleStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ScheduleResponse {
    private String id;
    private String busId;
    private String routeId;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private double fare;
    private ScheduleStatus status;
    private String travelName;
    private BusType busType;
    private String contactNumber;
    private String busModel;
    private int totalSeats;
    private int availableSeats;
}
