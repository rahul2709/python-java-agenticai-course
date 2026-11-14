package com.northstar.registration;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistrationRequest(
        @NotBlank @Size(max = 80) String firstName,
        @NotBlank @Size(max = 80) String lastName,
        @NotBlank @Size(max = 300) String address,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(max = 40) String phone) {
}
