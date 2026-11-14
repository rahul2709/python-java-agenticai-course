package com.northstar.registration;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {
    boolean existsByEmail(String email);
}
