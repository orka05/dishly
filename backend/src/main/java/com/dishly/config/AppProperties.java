package com.dishly.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * @param frontendUrl base URL of the Angular app, used to build links sent by email
 * @param activationTokenValidity how long an activation link stays valid
 * @param mailFrom sender address of outgoing emails
 */
@ConfigurationProperties("app")
public record AppProperties(
		@DefaultValue("http://localhost:4200") String frontendUrl,
		@DefaultValue("24h") Duration activationTokenValidity,
		@DefaultValue("Dishly <no-reply@dishly.local>") String mailFrom) {
}
