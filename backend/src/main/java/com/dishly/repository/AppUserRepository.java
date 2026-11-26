package com.dishly.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dishly.model.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

	boolean existsByUsernameIgnoreCase(String username);

	boolean existsByEmailIgnoreCase(String email);

	Optional<AppUser> findByUsernameIgnoreCase(String username);

	Optional<AppUser> findByEmailIgnoreCase(String email);
}
