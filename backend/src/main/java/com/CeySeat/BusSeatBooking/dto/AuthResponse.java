package com.CeySeat.BusSeatBooking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String userId;
    private String fullName;
    private String role;
    
}
