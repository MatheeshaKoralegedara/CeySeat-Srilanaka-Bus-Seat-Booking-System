package com.CeySeat.BusSeatBooking.model;

import lombok.Data;

@Data
public class Seat {
    private String seatNo; // "1A", "2B"
    private String type;   // "window", "aisle"
}

