package com.CeySeat.BusSeatBooking.dto;

import com.CeySeat.BusSeatBooking.model.BusType;
import com.CeySeat.BusSeatBooking.model.Seat;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class BusResponse {
    private String id;
    private String operatorId;
    private String operatorName;
    private String operatorEmail;
    private String registrationNo;
    private String model;
    private int totalSeats;
    private List<Seat> seatLayout;
    private String layoutType;
    private String travelName;
    private BusType busType;
    private String contactNumber;
}
