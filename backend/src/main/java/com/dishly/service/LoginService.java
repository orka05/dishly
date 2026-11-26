package com.dishly.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dishly.dto.LoginRequest;
import com.dishly.dto.LoginResponse;
import com.dishly.dto.UserResponse;
import com.dishly.exception.AccountNotActivatedException;
import com.dishly.exception.InvalidCredentialsException;
import com.dishly.model.AppUser;
import com.dishly.repository.AppUserRepository;

@Service
public class LoginService {

	private final AppUserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public LoginService(AppUserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	@Transactional(readOnly = true)
	public LoginResponse login(LoginRequest request) {
		AppUser user = findByIdentifier(request.identifier().strip())
				.filter(candidate -> passwordEncoder.matches(request.password(), candidate.getPasswordHash()))
				// Same error for unknown user and wrong password, so accounts cannot be enumerated.
				.orElseThrow(InvalidCredentialsException::new);

		if (!user.isActivated()) {
			throw new AccountNotActivatedException();
		}

		JwtService.IssuedToken token = jwtService.issue(user);
		return new LoginResponse(token.value(), token.expiresAt(), UserResponse.from(user));
	}

	@Transactional(readOnly = true)
	public Optional<AppUser> findById(Long id) {
		return userRepository.findById(id);
	}

	// Usernames cannot contain '@' (enforced by the DB schema), so '@' means an email address.
	private Optional<AppUser> findByIdentifier(String identifier) {
		return identifier.contains("@")
				? userRepository.findByEmailIgnoreCase(identifier)
				: userRepository.findByUsernameIgnoreCase(identifier);
	}
}
