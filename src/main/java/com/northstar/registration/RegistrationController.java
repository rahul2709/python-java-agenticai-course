package com.northstar.registration;

import java.net.URI;
import java.util.Locale;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.CONFLICT;

@RestController
@RequestMapping("/api/registrations")
@CrossOrigin(origins = {"http://127.0.0.1:8000", "http://localhost:8000"})
public class RegistrationController {
    private final RegistrationRepository registrations;

    public RegistrationController(RegistrationRepository registrations) {
        this.registrations = registrations;
    }

    @PostMapping
    public ResponseEntity<RegistrationResponse> create(@Valid @RequestBody RegistrationRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (registrations.existsByEmail(email)) {
            throw new ResponseStatusException(CONFLICT, "An account with this email address already exists.");
        }

        Registration registration = new Registration(
                request.firstName().trim(),
                request.lastName().trim(),
                request.address().trim(),
                email,
                request.phone().trim());
        Registration saved = registrations.save(registration);
        return ResponseEntity.created(URI.create("/api/registrations/" + saved.getId()))
                .body(RegistrationResponse.from(saved));
    }
}
