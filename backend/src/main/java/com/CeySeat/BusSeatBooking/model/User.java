package com.CeySeat.BusSeatBooking.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
    private String phone;

    private Role role;
}