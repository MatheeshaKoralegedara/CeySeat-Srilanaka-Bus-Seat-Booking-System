package com.CeySeat.BusSeatBooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

    @NotBlank
    @Pattern(regexp = "^(0|\\+94)7[0-9]{8}$", message = "Enter a valid Sri Lankan mobile number, e.g. 07XXXXXXXX")
    private String phone;

    @NotBlank
    @Pattern(regexp = "^([0-9]{9}[vVxX]|[0-9]{12})$", message = "Enter a valid NIC number (old: 9 digits + V/X, new: 12 digits)")
    private String nic;
}
