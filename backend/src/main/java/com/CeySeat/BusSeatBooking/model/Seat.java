package com.CeySeat.BusSeatBooking.model;

import lombok.Data;

@Data
public class Seat {
    private String seatNo;      // "1A", "2C", "R1" (rear bench)
    private String type;        // window | aisle | middle
    private int row;
    private String side;        // left | right | rear
    private boolean bookable = true; // false for driver-area/door blanks
}