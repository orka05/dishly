package com.dishly.dto;

import jakarta.validation.constraints.NotBlank;

/** @param identifier username or email address */
public record LoginRequest(@NotBlank String identifier, @NotBlank String password) {
}
