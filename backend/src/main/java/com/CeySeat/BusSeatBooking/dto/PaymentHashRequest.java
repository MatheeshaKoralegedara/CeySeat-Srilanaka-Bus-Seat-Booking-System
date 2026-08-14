package com.CeySeat.BusSeatBooking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentHashRequest {
    @NotBlank
    private String groupBookingId;
}
