package com.dishly.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.dishly.dto.LoginRequest;
import com.dishly.dto.LoginResponse;
import com.dishly.exception.AccountNotActivatedException;
import com.dishly.exception.InvalidCredentialsException;
import com.dishly.model.AppUser;
import com.dishly.repository.AppUserRepository;

class LoginServiceTest {

	private final AppUserRepository userRepository = mock();
	private final PasswordEncoder passwordEncoder = mock();
	private final JwtService jwtService = mock();
	private final LoginService service = new LoginService(userRepository, passwordEncoder, jwtService);

	@Test
	void logsInWithUsername() {
		AppUser user = activeUser();
		when(userRepository.findByUsernameIgnoreCase("cody")).thenReturn(Optional.of(user));
		when(passwordEncoder.matches("secret123", "hashed")).thenReturn(true);
		when(jwtService.issue(user)).thenReturn(new JwtService.IssuedToken("jwt", Instant.EPOCH));

		LoginResponse response = service.login(new LoginRequest(" cody ", "secret123"));

		assertThat(response.accessToken()).isEqualTo("jwt");
		assertThat(response.tokenType()).isEqualTo("Bearer");
		assertThat(response.user().username()).isEqualTo("cody");
	}

	@Test
	void identifierWithAtSignIsTreatedAsEmail() {
		AppUser user = activeUser();
		when(userRepository.findByEmailIgnoreCase("Cody@Example.com")).thenReturn(Optional.of(user));
		when(passwordEncoder.matches("secret123", "hashed")).thenReturn(true);
		when(jwtService.issue(user)).thenReturn(new JwtService.IssuedToken("jwt", Instant.EPOCH));

		assertThat(service.login(new LoginRequest("Cody@Example.com", "secret123")).accessToken()).isEqualTo("jwt");
		verify(userRepository, never()).findByUsernameIgnoreCase(any());
	}

	@Test
	void wrongPasswordAndUnknownUserFailTheSameWay() {
		when(userRepository.findByUsernameIgnoreCase("cody")).thenReturn(Optional.of(activeUser()));
		when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

		assertThatThrownBy(() -> service.login(new LoginRequest("cody", "wrong")))
				.isInstanceOf(InvalidCredentialsException.class);
		assertThatThrownBy(() -> service.login(new LoginRequest("nobody", "secret123")))
				.isInstanceOf(InvalidCredentialsException.class);
		verify(jwtService, never()).issue(any());
	}

	@Test
	void rejectsAccountThatIsNotActivated() {
		AppUser user = new AppUser("cody", "cody@example.com", "hashed");
		when(userRepository.findByUsernameIgnoreCase("cody")).thenReturn(Optional.of(user));
		when(passwordEncoder.matches("secret123", "hashed")).thenReturn(true);

		assertThatThrownBy(() -> service.login(new LoginRequest("cody", "secret123")))
				.isInstanceOf(AccountNotActivatedException.class);
		verify(jwtService, never()).issue(any());
	}

	private static AppUser activeUser() {
		AppUser user = new AppUser("cody", "cody@example.com", "hashed");
		user.activate();
		return user;
	}
}
