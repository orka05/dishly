package com.dishly.dto;

import jakarta.validation.constraints.NotBlank;

public record ActivateAccountRequest(@NotBlank String token) {
}
