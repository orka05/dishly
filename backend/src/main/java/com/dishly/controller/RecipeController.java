package com.dishly.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dishly.dto.PantryRecipes;
import com.dishly.dto.RecipeCard;
import com.dishly.dto.RecipeDetails;
import com.dishly.service.RecipeService;

@RestController
@RequestMapping("/dishly/recipe")
public class RecipeController {

	@Autowired
	RecipeService recipeService;
	
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<List<RecipeCard>> getAllRecipeCards(){
		return new ResponseEntity<List<RecipeCard>>(recipeService.getAllCards(), HttpStatus.OK);
	}
	
	@GetMapping(value = "/rated",  produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<List<RecipeCard>> getAllRecipeCardsSortedBy(){
		return new ResponseEntity<List<RecipeCard>>(recipeService.getAllCardsSortedByRating(), HttpStatus.OK);
	}

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<RecipeDetails> getRecipeDetails(@PathVariable("id") long id) {
        return ResponseEntity.of(recipeService.getRecipeDetails(id));
    }

    @GetMapping(value = "/from-my-ingredients", produces = MediaType.APPLICATION_JSON_VALUE)
    public PantryRecipes getPantryRecipes(@AuthenticationPrincipal Jwt jwt) {
        return recipeService.getPantryRecipes(Long.parseLong(jwt.getSubject()));
    }
}
