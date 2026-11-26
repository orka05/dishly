package com.dishly.service;

public record UserRegisteredEvent(String username, String email, String activationToken) {
}
