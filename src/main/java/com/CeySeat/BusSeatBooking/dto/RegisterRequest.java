package com.CeySeat.BusSeatBooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data

public class RegisterRequest {
    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    private String phone;
    
}
