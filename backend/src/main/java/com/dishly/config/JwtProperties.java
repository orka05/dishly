package com.dishly.config;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * @param secret Base64-encoded HMAC key used to sign tokens (at least 256 bits)
 * @param validity how long an access token stays valid
 * @param issuer value of the {@code iss} claim
 */
@ConfigurationProperties("app.jwt")
public record JwtProperties(String secret, @DefaultValue("30d") Duration validity,
		@DefaultValue("dishly") String issuer) {

	private static final int MIN_KEY_BYTES = 32;

	public JwtProperties {
		if (secret == null || secret.isBlank() || secret.startsWith("CHANGE_ME")) {
			throw new IllegalStateException("app.jwt.secret is not set. See application.properties.example.");
		}
		if (secretBytes(secret).length < MIN_KEY_BYTES) {
			throw new IllegalStateException("app.jwt.secret must be at least 256 bits (32 bytes) long.");
		}
	}

	public byte[] secretBytes() {
		return secretBytes(secret);
	}

	private static byte[] secretBytes(String secret) {
		try {
			return Base64.getDecoder().decode(secret);
		}
		catch (IllegalArgumentException ex) {
			// Allow a plain-text secret as well; length is still enforced.
			return secret.getBytes(StandardCharsets.UTF_8);
		}
	}
}
