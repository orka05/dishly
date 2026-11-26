package com.dishly.config;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import com.dishly.service.JwtService;

/**
 * Stateless security: the Angular app sends {@code Authorization: Bearer <jwt>} with every request.
 * Endpoints are public unless listed as protected, so existing pages (home, recipes, images) keep working.
 */
@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
				// No cookies/sessions are used, so CSRF protection is not needed.
				.csrf(csrf -> csrf.disable())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
						.requestMatchers("/dishly/recipe/from-my-ingredients").authenticated()
						.anyRequest().permitAll())
				.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
				.build();
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public JwtEncoder jwtEncoder(JwtProperties properties) {
		return NimbusJwtEncoder.withSecretKey(secretKey(properties)).algorithm(MacAlgorithm.HS256).build();
	}

	@Bean
	public JwtDecoder jwtDecoder(JwtProperties properties) {
		NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(secretKey(properties))
				.macAlgorithm(MacAlgorithm.HS256)
				.build();
		decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(properties.issuer()));
		return decoder;
	}

	/** Maps the {@code role} claim to a Spring authority, e.g. {@code ROLE_ADMIN}, for future admin endpoints. */
	@Bean
	JwtAuthenticationConverter jwtAuthenticationConverter() {
		JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
		authorities.setAuthoritiesClaimName(JwtService.ROLE_CLAIM);
		authorities.setAuthorityPrefix("ROLE_");

		JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
		converter.setJwtGrantedAuthoritiesConverter(authorities);
		return converter;
	}

	private static SecretKey secretKey(JwtProperties properties) {
		return new SecretKeySpec(properties.secretBytes(), "HmacSHA256");
	}
}
