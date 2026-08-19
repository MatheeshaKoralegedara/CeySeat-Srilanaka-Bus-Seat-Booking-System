package com.CeySeat.BusSeatBooking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerificationStatusResponse {
    private boolean emailVerified;
}
