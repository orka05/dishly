package com.dishly.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.util.Base64;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;

import com.dishly.config.JwtProperties;
import com.dishly.config.SecurityConfig;
import com.dishly.model.AppUser;

class JwtServiceTest {

	private static final JwtProperties PROPERTIES = properties("a".repeat(32));

	private final SecurityConfig config = new SecurityConfig();
	private final JwtService jwtService = new JwtService(config.jwtEncoder(PROPERTIES), PROPERTIES);

	@Test
	void issuedTokenContainsUserClaims() {
		AppUser user = new AppUser("cody", "cody@example.com", "hashed");

		Jwt jwt = config.jwtDecoder(PROPERTIES).decode(jwtService.issue(user).value());

		assertThat(jwt.getClaimAsString(JwtService.USERNAME_CLAIM)).isEqualTo("cody");
		assertThat(jwt.getClaimAsString(JwtService.EMAIL_CLAIM)).isEqualTo("cody@example.com");
		assertThat(jwt.getClaimAsString(JwtService.ROLE_CLAIM)).isEqualTo("USER");
		assertThat(jwt.getClaimAsString("iss")).isEqualTo("dishly");
		assertThat(jwt.getExpiresAt()).isAfter(jwt.getIssuedAt().plus(Duration.ofDays(29)));
	}

	@Test
	void tokenSignedWithAnotherKeyIsRejected() {
		String token = jwtService.issue(new AppUser("cody", "cody@example.com", "hashed")).value();
		JwtProperties otherKey = properties("b".repeat(32));

		assertThatThrownBy(() -> config.jwtDecoder(otherKey).decode(token)).isInstanceOf(JwtException.class);
	}

	private static JwtProperties properties(String rawSecret) {
		String secret = Base64.getEncoder().encodeToString(rawSecret.getBytes());
		return new JwtProperties(secret, Duration.ofDays(30), "dishly");
	}
}
