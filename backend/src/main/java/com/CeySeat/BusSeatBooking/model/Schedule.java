package com.CeySeat.BusSeatBooking.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "schedules")
public class Schedule {
    @Id
    private String id;

    @NotBlank(message = "Bus is required")
    private String busId;

    @NotBlank(message = "Route is required")
    private String routeId;

    @NotNull(message = "Departure time is required")
    private LocalDateTime departureTime;

    @NotNull(message = "Arrival time is required")
    private LocalDateTime arrivalTime;

    @Positive(message = "Fare must be greater than zero")
    private double fare;

    private ScheduleStatus status = ScheduleStatus.PENDING;
}
