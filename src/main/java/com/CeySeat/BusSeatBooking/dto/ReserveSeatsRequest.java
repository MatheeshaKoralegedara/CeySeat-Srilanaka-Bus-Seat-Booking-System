package com.CeySeat.BusSeatBooking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ReserveSeatsRequest {
    @NotBlank
    private String scheduleId;

    @NotBlank
    private String userId;

    @NotEmpty
    private List<String> seatNumbers;
}
