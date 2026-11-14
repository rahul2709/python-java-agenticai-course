package com.northstar.registration;

import java.time.Instant;

public record RegistrationResponse(
        Long id,
        String firstName,
        String lastName,
        String address,
        String email,
        String phone,
        Instant createdAt) {
    public static RegistrationResponse from(Registration registration) {
        return new RegistrationResponse(
                registration.getId(),
                registration.getFirstName(),
                registration.getLastName(),
                registration.getAddress(),
                registration.getEmail(),
                registration.getPhone(),
                registration.getCreatedAt());
    }
}
