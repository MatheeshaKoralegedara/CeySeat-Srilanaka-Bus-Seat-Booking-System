package com.CeySeat.BusSeatBooking.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
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

    @NotBlank(message = "Registration number is required")
    private String registrationNo;

    @NotBlank(message = "Model is required")
    private String model;

    @Positive(message = "Total seats must be greater than zero")
    private int totalSeats;

    private List<Seat> seatLayout;
    private String layoutType; // "2+2", "3+2", etc.

    @NotBlank(message = "Travel name is required")
    private String travelName;

    private BusType busType;
    private String contactNumber;
}