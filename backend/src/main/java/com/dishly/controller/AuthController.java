package com.dishly.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dishly.dto.ActivateAccountRequest;
import com.dishly.dto.AvailabilityResponse;
import com.dishly.dto.MessageResponse;
import com.dishly.dto.RegisterRequest;
import com.dishly.dto.RegisterResponse;
import com.dishly.model.AppUser;
import com.dishly.service.RegistrationService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

	private final RegistrationService registrationService;

	public AuthController(RegistrationService registrationService) {
		this.registrationService = registrationService;
	}

	@PostMapping("/register")
	public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
		AppUser user = registrationService.register(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(RegisterResponse.from(user, "Account created. Check your email for the activation link."));
	}

	@GetMapping("/availability/username")
	public ResponseEntity<AvailabilityResponse> isUsernameAvailable(@RequestParam @NotBlank String value) {
		return ResponseEntity.ok(new AvailabilityResponse(registrationService.isUsernameAvailable(value)));
	}

	@GetMapping("/availability/email")
	public ResponseEntity<AvailabilityResponse> isEmailAvailable(@RequestParam @NotBlank String value) {
		return ResponseEntity.ok(new AvailabilityResponse(registrationService.isEmailAvailable(value)));
	}

	@PostMapping("/activate")
	public ResponseEntity<MessageResponse> activate(@Valid @RequestBody ActivateAccountRequest request) {
		registrationService.activate(request.token());
		return ResponseEntity.ok(new MessageResponse("Account activated. You can now log in."));
	}
}
