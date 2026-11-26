package com.dishly.dto;

import java.time.Instant;

public record LoginResponse(String accessToken, String tokenType, Instant expiresAt, UserResponse user) {

	public LoginResponse(String accessToken, Instant expiresAt, UserResponse user) {
		this(accessToken, "Bearer", expiresAt, user);
	}
}
