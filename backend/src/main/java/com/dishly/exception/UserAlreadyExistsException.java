package com.dishly.exception;

import java.util.Map;

/** Thrown when the username and/or email are already registered. Keys are field names. */
public class UserAlreadyExistsException extends RuntimeException {

	private final Map<String, String> conflicts;

	public UserAlreadyExistsException(Map<String, String> conflicts) {
		super("User already exists: " + conflicts.keySet());
		this.conflicts = Map.copyOf(conflicts);
	}

	public Map<String, String> getConflicts() {
		return conflicts;
	}
}
