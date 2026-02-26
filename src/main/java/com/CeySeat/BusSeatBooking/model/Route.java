package com.CeySeat.BusSeatBooking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "routes")
public class Route {
    @Id
    private String id;
    private String source;
    private String destination;
    private double distance; // in km
    private String estimatedTime; // e.g., "5 hours"
}
