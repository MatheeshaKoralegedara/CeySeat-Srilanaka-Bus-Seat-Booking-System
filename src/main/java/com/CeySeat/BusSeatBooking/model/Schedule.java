package com.CeySeat.BusSeatBooking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "schedules")
public class Schedule {
    @Id
    private String id;
    private String busId;
    private String routeId;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private double fare;
}
