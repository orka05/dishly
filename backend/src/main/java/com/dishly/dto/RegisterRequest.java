package com.dishly.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Mirrors the client-side validators in the Angular sign-up form. */
public record RegisterRequest(
		@NotBlank
		@Size(min = 3, max = 30)
		@Pattern(regexp = "^[a-zA-Z0-9._]+$", message = "can contain only letters, numbers, dots and underscores")
		String username,

		@NotBlank
		@Size(max = 254)
		@Pattern(regexp = ValidationPatterns.EMAIL, message = "must be a valid email address")
		String email,

		@NotBlank
		// BCrypt only uses the first 72 bytes of a password.
		@Size(min = 8, max = 72)
		@Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d).*$", message = "must contain at least one letter and one number")
		String password) {
}
