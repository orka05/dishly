package com.dishly.controller;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/admin/catalogs", headers = "X-Requested-With=XMLHttpRequest")
public class AdminCatalogController {
	private final JdbcClient jdbc;

	public AdminCatalogController(JdbcClient jdbc) {
		this.jdbc = jdbc;
	}

	@GetMapping("/{catalog}")
	public List<Entry> list(@PathVariable String catalog) {
		return jdbc.sql("SELECT code, name FROM " + table(catalog))
				.query(Entry.class)
				.list();
	}

	@PostMapping("/{catalog}")
	@ResponseStatus(HttpStatus.CREATED)
	public Entry create(@PathVariable String catalog, @RequestBody NameRequest request) {
		Entry entry = new Entry(UUID.randomUUID().toString(), validatedName(request));
		jdbc.sql("INSERT INTO " + table(catalog) + " (code, name) VALUES (:code, :name)")
				.param("code", entry.code())
				.param("name", entry.name())
				.update();
		return entry;
	}

	@PutMapping("/{catalog}/{code}")
	public Entry update(@PathVariable String catalog, @PathVariable String code, @RequestBody NameRequest request) {
		String name = validatedName(request);
		requireEntry(jdbc.sql("UPDATE " + table(catalog) + " SET name = :name WHERE code = :code")
				.param("code", code)
				.param("name", name)
				.update());
		return new Entry(code, name);
	}

	@DeleteMapping("/{catalog}/{code}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable String catalog, @PathVariable String code) {
		requireEntry(jdbc.sql("DELETE FROM " + table(catalog) + " WHERE code = :code")
				.param("code", code)
				.update());
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	@ResponseStatus(HttpStatus.CONFLICT)
	void conflict() {
	}

	private static String table(String catalog) {
		return switch (catalog) {
			case "meal-types" -> "meal_types";
			case "dish-types" -> "dish_types";
			case "diet-types" -> "diet_types";
			case "ingredient-categories" -> "ingredient_categories";
			case "allergens" -> "allergens";
			default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND);
		};
	}

	private static String validatedName(NameRequest request) {
		String name = request.name() == null ? "" : request.name().strip();
		if (name.isEmpty() || name.length() > 120) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
		}
		return name;
	}

	private static void requireEntry(int updated) {
		if (updated == 0) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND);
		}
	}

	public record Entry(String code, String name) {}

	public record NameRequest(String name) {}
}
