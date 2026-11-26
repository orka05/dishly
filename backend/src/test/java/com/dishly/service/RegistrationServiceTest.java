package com.dishly.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.dishly.config.AppProperties;
import com.dishly.dto.RegisterRequest;
import com.dishly.exception.InvalidTokenException;
import com.dishly.exception.UserAlreadyExistsException;
import com.dishly.model.AccountToken;
import com.dishly.model.AppUser;
import com.dishly.model.TokenPurpose;
import com.dishly.repository.AppUserRepository;

class RegistrationServiceTest {

	private static final String TOKEN = "raw-token";

	private final AppUserRepository userRepository = mock();
	private final AccountTokenService tokenService = mock();
	private final PasswordEncoder passwordEncoder = mock();
	private final ApplicationEventPublisher eventPublisher = mock();

	private RegistrationService service;

	@BeforeEach
	void setUp() {
		var properties = new AppProperties("http://localhost:4200", Duration.ofHours(24), "Dishly <no-reply@test>");
		service = new RegistrationService(userRepository, tokenService, passwordEncoder, eventPublisher, properties);
	}

	@Test
	void registerStoresHashedPasswordAndPublishesActivationToken() {
		when(passwordEncoder.encode("secret123")).thenReturn("hashed");
		when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(tokenService.issue(any(), eq(TokenPurpose.ACTIVATION), eq(Duration.ofHours(24)))).thenReturn(TOKEN);

		AppUser created = service.register(new RegisterRequest(" cody ", "cody@example.com", "secret123"));

		assertThat(created.getUsername()).isEqualTo("cody");
		assertThat(created.isActivated()).isFalse();

		verify(userRepository).save(org.mockito.ArgumentMatchers.argThat(user ->
				user.getUsername().equals("cody") && user.getPasswordHash().equals("hashed") && !user.isActivated()));
		verify(eventPublisher).publishEvent(new UserRegisteredEvent("cody", "cody@example.com", TOKEN));
	}

	@Test
	void registerReportsEveryTakenField() {
		when(userRepository.existsByUsernameIgnoreCase("cody")).thenReturn(true);
		when(userRepository.existsByEmailIgnoreCase("cody@example.com")).thenReturn(true);

		assertThatThrownBy(() -> service.register(new RegisterRequest("cody", "cody@example.com", "secret123")))
				.isInstanceOfSatisfying(UserAlreadyExistsException.class, ex -> assertThat(ex.getConflicts())
						.isEqualTo(Map.of("username", "taken", "email", "taken")));
		verify(userRepository, never()).save(any());
	}

	@Test
	void activateMarksTokenUsedAndActivatesUser() {
		AppUser user = newUser();
		AccountToken token = newToken(user, Instant.now().plusSeconds(60));
		when(tokenService.find(TOKEN, TokenPurpose.ACTIVATION)).thenReturn(token);

		service.activate(TOKEN);

		assertThat(user.isActivated()).isTrue();
		assertThat(token.isUsed()).isTrue();
	}

	@Test
	void activateRejectsExpiredToken() {
		AppUser user = newUser();
		when(tokenService.find(TOKEN, TokenPurpose.ACTIVATION)).thenReturn(newToken(user, Instant.now().minusSeconds(1)));

		assertThatThrownBy(() -> service.activate(TOKEN)).isInstanceOf(InvalidTokenException.class);
		assertThat(user.isActivated()).isFalse();
	}

	@Test
	void activateIsIdempotentForAlreadyActivatedUser() {
		AppUser user = newUser();
		AccountToken token = newToken(user, Instant.now().plusSeconds(60));
		token.markUsed();
		user.activate();
		when(tokenService.find(TOKEN, TokenPurpose.ACTIVATION)).thenReturn(token);

		service.activate(TOKEN);

		assertThat(user.isActivated()).isTrue();
	}

	private static AppUser newUser() {
		return new AppUser("cody", "cody@example.com", "hashed");
	}

	private static AccountToken newToken(AppUser user, Instant expiresAt) {
		return new AccountToken(new byte[32], user, TokenPurpose.ACTIVATION, expiresAt);
	}
}
