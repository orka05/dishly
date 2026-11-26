package com.dishly.service;

import java.time.Instant;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.dishly.config.JwtProperties;
import com.dishly.model.AppUser;

@Service
public class JwtService {

	public static final String USERNAME_CLAIM = "username";
	public static final String EMAIL_CLAIM = "email";
	public static final String ROLE_CLAIM = "role";

	private final JwtEncoder jwtEncoder;
	private final JwtProperties properties;

	public JwtService(JwtEncoder jwtEncoder, JwtProperties properties) {
		this.jwtEncoder = jwtEncoder;
		this.properties = properties;
	}

	public IssuedToken issue(AppUser user) {
		Instant issuedAt = Instant.now();
		Instant expiresAt = issuedAt.plus(properties.validity());

		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer(properties.issuer())
				.subject(String.valueOf(user.getId()))
				.issuedAt(issuedAt)
				.expiresAt(expiresAt)
				.claim(USERNAME_CLAIM, user.getUsername())
				.claim(EMAIL_CLAIM, user.getEmail())
				.claim(ROLE_CLAIM, user.getRole().name())
				.build();
		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

		String value = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
		return new IssuedToken(value, expiresAt);
	}

	public record IssuedToken(String value, Instant expiresAt) {
	}
}
