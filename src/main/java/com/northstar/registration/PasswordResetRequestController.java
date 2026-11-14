package com.northstar.registration;

import java.util.Locale;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/password-reset-requests")
@CrossOrigin(origins = {"http://127.0.0.1:8000", "http://localhost:8000"})
public class PasswordResetRequestController {
    private static final String GENERIC_MESSAGE =
            "Your request has been recorded. Password reset emails are not enabled in this demo.";

    private final PasswordResetRequestRepository requests;

    public PasswordResetRequestController(PasswordResetRequestRepository requests) {
        this.requests = requests;
    }

    @PostMapping
    public ResponseEntity<PasswordResetRequestResponse> create(
            @Valid @RequestBody PasswordResetRequestPayload payload) {
        String email = payload.email().trim().toLowerCase(Locale.ROOT);
        requests.save(new PasswordResetRequest(email));
        return ResponseEntity.accepted().body(new PasswordResetRequestResponse(GENERIC_MESSAGE));
    }
}
