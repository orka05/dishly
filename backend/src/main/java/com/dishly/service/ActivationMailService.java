package com.dishly.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.UriComponentsBuilder;

import com.dishly.config.AppProperties;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class ActivationMailService {

	private static final Logger log = LoggerFactory.getLogger(ActivationMailService.class);

	private final ObjectProvider<JavaMailSender> mailSender;
	private final AppProperties properties;

	public ActivationMailService(ObjectProvider<JavaMailSender> mailSender, AppProperties properties) {
		this.mailSender = mailSender;
		this.properties = properties;
	}

	/** Runs only after the user is committed, so no email is sent for a failed registration. */
	@Async
	@TransactionalEventListener
	public void onUserRegistered(UserRegisteredEvent event) {
		String activationLink = UriComponentsBuilder.fromUriString(properties.frontendUrl())
				.path("/activate")
				.queryParam("token", event.activationToken())
				.toUriString();

		JavaMailSender sender = mailSender.getIfAvailable();
		if (sender == null) {
			// spring.mail.host is not configured (local development without SMTP).
			log.warn("Mail is not configured. Activation link for {}: {}", event.email(), activationLink);
			return;
		}

		try {
			MimeMessage message = sender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
			helper.setFrom(properties.mailFrom());
			helper.setTo(event.email());
			helper.setSubject("Activate your Dishly account");
			helper.setText(buildBody(event.username(), activationLink), true);
			sender.send(message);
			log.info("Activation email sent to {}", event.email());
		}
		catch (MessagingException | MailException ex) {
			log.error("Failed to send activation email to {}", event.email(), ex);
		}
	}

	private String buildBody(String username, String activationLink) {
		long validHours = properties.activationTokenValidity().toHours();
		return """
				<p>Hi %s,</p>
				<p>Thanks for signing up for Dishly! Click the link below to activate your account:</p>
				<p><a href="%s">Activate my account</a></p>
				<p>The link is valid for %d hours. If you did not create an account, you can ignore this email.</p>
				""".formatted(HtmlUtils.htmlEscape(username), activationLink, validHours);
	}
}
