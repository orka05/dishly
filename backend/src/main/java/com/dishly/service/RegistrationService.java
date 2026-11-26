package com.dishly.service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dishly.config.AppProperties;
import com.dishly.dto.RegisterRequest;
import com.dishly.exception.InvalidTokenException;
import com.dishly.exception.UserAlreadyExistsException;
import com.dishly.model.AccountToken;
import com.dishly.model.AppUser;
import com.dishly.model.TokenPurpose;
import com.dishly.repository.AppUserRepository;

@Service
public class RegistrationService {

	public static final String TAKEN = "taken";

	private final AppUserRepository userRepository;
	private final AccountTokenService tokenService;
	private final PasswordEncoder passwordEncoder;
	private final ApplicationEventPublisher eventPublisher;
	private final AppProperties properties;

	public RegistrationService(AppUserRepository userRepository, AccountTokenService tokenService,
			PasswordEncoder passwordEncoder, ApplicationEventPublisher eventPublisher, AppProperties properties) {
		this.userRepository = userRepository;
		this.tokenService = tokenService;
		this.passwordEncoder = passwordEncoder;
		this.eventPublisher = eventPublisher;
		this.properties = properties;
	}

	@Transactional(readOnly = true)
	public boolean isUsernameAvailable(String username) {
		return !userRepository.existsByUsernameIgnoreCase(username.strip());
	}

	@Transactional(readOnly = true)
	public boolean isEmailAvailable(String email) {
		return !userRepository.existsByEmailIgnoreCase(email.strip());
	}

	/**
	 * Creates an inactive account and sends the activation email once the transaction commits.
	 * The user cannot log in until the account is activated.
	 */
	@Transactional
	public AppUser register(RegisterRequest request) {
		String username = request.username().strip();
		String email = request.email().strip();

		Map<String, String> conflicts = new LinkedHashMap<>();
		if (!isUsernameAvailable(username)) {
			conflicts.put("username", TAKEN);
		}
		if (!isEmailAvailable(email)) {
			conflicts.put("email", TAKEN);
		}
		if (!conflicts.isEmpty()) {
			throw new UserAlreadyExistsException(conflicts);
		}

		AppUser user = userRepository.save(new AppUser(username, email, passwordEncoder.encode(request.password())));
		String activationToken = tokenService.issue(user, TokenPurpose.ACTIVATION,
				properties.activationTokenValidity());

		eventPublisher.publishEvent(new UserRegisteredEvent(username, email, activationToken));
		return user;
	}

	@Transactional
	public void activate(String rawToken) {
		AccountToken token = tokenService.find(rawToken, TokenPurpose.ACTIVATION);
		AppUser user = token.getUser();

		// Clicking the link a second time should not show an error to an already active user.
		if (token.isUsed() && user.isActivated()) {
			return;
		}
		if (token.isUsed() || token.isExpired(Instant.now())) {
			throw new InvalidTokenException("The activation link has expired.");
		}

		token.markUsed();
		user.activate();
	}
}
