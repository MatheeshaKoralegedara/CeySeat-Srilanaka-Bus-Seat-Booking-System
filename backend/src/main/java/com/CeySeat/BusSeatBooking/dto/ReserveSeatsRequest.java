package com.CeySeat.BusSeatBooking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ReserveSeatsRequest {
    @NotBlank
    private String scheduleId;

    @NotEmpty
    private List<String> seatNumbers;

    // One gender per seat — keyed by seat number, so a mixed-gender group
    // (e.g. one seat MALE, another FEMALE) can be reserved in a single request.
    @NotEmpty
    private Map<String, String> passengerGenders;
}
