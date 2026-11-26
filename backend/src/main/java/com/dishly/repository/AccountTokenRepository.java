package com.dishly.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dishly.model.AccountToken;

public interface AccountTokenRepository extends JpaRepository<AccountToken, byte[]> {
}
