package com.dishly.dto;

import java.time.Instant;

import com.dishly.model.AppUser;
import com.dishly.model.Role;

/** Public view of a newly registered user. Never exposes the password hash. */
public record RegisterResponse(Long id, String username, String email, Role role, boolean activated,
		Instant createdAt, String message) {

	public static RegisterResponse from(AppUser user, String message) {
		return new RegisterResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
				user.isActivated(), user.getCreatedAt(), message);
	}
}
