package com.northstar.registration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:registration-test;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
class RegistrationControllerTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordResetRequestRepository passwordResetRequests;

    @Test
    void redirectsDashboardRouteToDashboardPage() throws Exception {
        mockMvc.perform(get("/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/dashboard.html"));
    }

    @Test
    void createsRegistration() throws Exception {
        mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Ada",
                                  "lastName": "Lovelace",
                                  "address": "12 Example Lane",
                                  "email": "ada-create@example.invalid",
                                  "phone": "+1 555 0100"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email", is("ada-create@example.invalid")))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    void rejectsDuplicateEmail() throws Exception {
        String request = """
                {
                  "firstName": "Ada",
                  "lastName": "Lovelace",
                  "address": "12 Example Lane",
                  "email": "ada-duplicate@example.invalid",
                  "phone": "+1 555 0100"
                }
                """;
        mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", is("An account with this email address already exists.")));
    }

    @Test
    void rejectsMissingFieldsAndInvalidEmail() throws Exception {
        mockMvc.perform(post("/api/registrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "",
                                  "lastName": "",
                                  "address": "",
                                  "email": "not-an-email",
                                  "phone": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.firstName").exists())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.phone").exists());
    }

    @Test
    void recordsPasswordResetRequestWithNormalizedEmail() throws Exception {
        mockMvc.perform(post("/api/password-reset-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "Reset-Request@example.invalid"
                                }
                                """))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").exists());

        assertTrue(passwordResetRequests.existsByEmail("reset-request@example.invalid"));
    }

    @Test
    void rejectsPasswordResetRequestWithInvalidEmail() throws Exception {
        mockMvc.perform(post("/api/password-reset-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "not-an-email"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }
}
