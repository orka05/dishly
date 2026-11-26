package com.dishly.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * One-time token sent to the user by email. Only the SHA-256 hash of the token is stored, so a
 * leaked database cannot be used to activate accounts or reset passwords.
 */
@Entity
@Table(name = "account_tokens")
public class AccountToken {

	@Id
	@Column(name = "token_hash")
	private byte[] tokenHash;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private AppUser user;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TokenPurpose purpose;

	@Column(name = "expires_at", nullable = false)
	private Instant expiresAt;

	@Column(name = "used_at")
	private Instant usedAt;

	protected AccountToken() {
	}

	public AccountToken(byte[] tokenHash, AppUser user, TokenPurpose purpose, Instant expiresAt) {
		this.tokenHash = tokenHash;
		this.user = user;
		this.purpose = purpose;
		this.expiresAt = expiresAt;
	}

	public boolean isUsed() {
		return usedAt != null;
	}

	public boolean isExpired(Instant now) {
		return !now.isBefore(expiresAt);
	}

	public void markUsed() {
		usedAt = Instant.now();
	}

	public AppUser getUser() {
		return user;
	}

	public TokenPurpose getPurpose() {
		return purpose;
	}
}
