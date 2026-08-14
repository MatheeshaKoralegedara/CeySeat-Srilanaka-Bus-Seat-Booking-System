package com.CeySeat.BusSeatBooking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "buses")
public class Bus {
    @Id
    private String id;
    private String operatorId;
    private String registrationNo;
    private String model;
    private int totalSeats;
    private List<Seat> seatLayout;
    private String layoutType; // "2+2", "3+2", etc.
    private String travelName;
    private BusType busType;
    private String contactNumber;
}