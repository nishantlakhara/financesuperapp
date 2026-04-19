package com.finance.superapp.auth;

import java.util.Optional;
import org.springframework.security.core.Authentication;

public interface JwtTokenVerifier {

    Optional<Authentication> verify(String token);
}
