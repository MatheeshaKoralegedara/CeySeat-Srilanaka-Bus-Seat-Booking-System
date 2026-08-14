package com.CeySeat.BusSeatBooking.model;

public enum BookingStatus {
    RESERVED,   // hold placed, payment pending
    PAID,       // confirmed
    EXPIRED,    // hold timed out, seat released
    CANCELLED
}
