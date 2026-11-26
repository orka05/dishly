package com.dishly.exception;

public class AccountNotActivatedException extends RuntimeException {

	public AccountNotActivatedException() {
		super("Your account is not activated yet. Check your email for the activation link.");
	}
}
