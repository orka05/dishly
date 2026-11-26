package com.dishly.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

import org.springframework.stereotype.Service;

import com.dishly.exception.InvalidTokenException;
import com.dishly.model.AccountToken;
import com.dishly.model.AppUser;
import com.dishly.model.TokenPurpose;
import com.dishly.repository.AccountTokenRepository;

@Service
public class AccountTokenService {

	private static final int TOKEN_BYTES = 32;

	private final AccountTokenRepository tokenRepository;
	private final SecureRandom secureRandom = new SecureRandom();

	public AccountTokenService(AccountTokenRepository tokenRepository) {
		this.tokenRepository = tokenRepository;
	}

	/** Creates a token and returns its raw value. The raw value is never stored. */
	public String issue(AppUser user, TokenPurpose purpose, Duration validity) {
		byte[] randomBytes = new byte[TOKEN_BYTES];
		secureRandom.nextBytes(randomBytes);
		String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

		tokenRepository.save(new AccountToken(hash(rawToken), user, purpose, Instant.now().plus(validity)));
		return rawToken;
	}

	public AccountToken find(String rawToken, TokenPurpose purpose) {
		return tokenRepository.findById(hash(rawToken))
				.filter(token -> token.getPurpose() == purpose)
				.orElseThrow(() -> new InvalidTokenException("The link is invalid."));
	}

	private static byte[] hash(String rawToken) {
		try {
			return MessageDigest.getInstance("SHA-256").digest(rawToken.getBytes(StandardCharsets.UTF_8));
		}
		catch (NoSuchAlgorithmException ex) {
			throw new IllegalStateException("SHA-256 is not available", ex);
		}
	}
}
