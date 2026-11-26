package com.dishly.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.dishly.exception.AccountNotActivatedException;
import com.dishly.exception.InvalidCredentialsException;
import com.dishly.exception.InvalidTokenException;
import com.dishly.exception.UserAlreadyExistsException;
import com.dishly.service.RegistrationService;

/** Returns RFC 9457 problem details. Field-level errors are exposed in the {@code errors} property. */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

	private static final String ERRORS = "errors";

	@Override
	protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {
		Map<String, String> errors = new LinkedHashMap<>();
		for (FieldError error : ex.getBindingResult().getFieldErrors()) {
			errors.putIfAbsent(error.getField(), error.getDefaultMessage());
		}
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed.");
		problem.setProperty(ERRORS, errors);
		return ResponseEntity.badRequest().body(problem);
	}

	@ExceptionHandler(UserAlreadyExistsException.class)
	ProblemDetail handleUserAlreadyExists(UserAlreadyExistsException ex) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "User already exists.");
		problem.setProperty(ERRORS, ex.getConflicts());
		return problem;
	}

	/** Two concurrent registrations with the same username/email both pass the check; the DB index wins. */
	@ExceptionHandler(DataIntegrityViolationException.class)
	ProblemDetail handleDataIntegrityViolation(DataIntegrityViolationException ex) {
		String message = String.valueOf(ex.getMostSpecificCause().getMessage());
		Map<String, String> errors = new LinkedHashMap<>();
		if (message.contains("app_users_username_uq")) {
			errors.put("username", RegistrationService.TAKEN);
		}
		if (message.contains("app_users_email_uq")) {
			errors.put("email", RegistrationService.TAKEN);
		}
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Data conflict.");
		problem.setProperty(ERRORS, errors);
		return problem;
	}

	@ExceptionHandler(InvalidTokenException.class)
	ProblemDetail handleInvalidToken(InvalidTokenException ex) {
		return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
	}

	@ExceptionHandler(InvalidCredentialsException.class)
	ProblemDetail handleInvalidCredentials(InvalidCredentialsException ex) {
		return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
	}

	@ExceptionHandler(AccountNotActivatedException.class)
	ProblemDetail handleAccountNotActivated(AccountNotActivatedException ex) {
		return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, ex.getMessage());
	}
}
