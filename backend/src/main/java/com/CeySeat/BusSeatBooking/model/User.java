package com.CeySeat.BusSeatBooking.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @NotBlank
    @Email
    @Indexed(unique = true)
    private String email;

    @JsonIgnore
    @NotBlank
    private String password;

    private String fullName;

    @Pattern(regexp = "^(0|\\+94)7[0-9]{8}$", message = "Enter a valid Sri Lankan mobile number, e.g. 07XXXXXXXX")
    private String phone;

    @Pattern(regexp = "^([0-9]{9}[vVxX]|[0-9]{12})$", message = "Enter a valid NIC number (old: 9 digits + V/X, new: 12 digits)")
    private String nic;

    private Role role;
}