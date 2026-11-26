package com.dishly.dto;

import com.dishly.model.AppUser;
import com.dishly.model.Role;

public record UserResponse(Long id, String username, String email, Role role) {

	public static UserResponse from(AppUser user) {
		return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
	}
}
