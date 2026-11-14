package com.northstar.registration;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordResetRequestPayload(
        @NotBlank @Email @Size(max = 254) String email) {
}
