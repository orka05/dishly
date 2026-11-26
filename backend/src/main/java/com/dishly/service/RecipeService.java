package com.dishly.service;

import java.util.List;
import java.util.Optional;

import com.dishly.dto.RecipeCard;
import com.dishly.dto.RecipeDetails;

public interface RecipeService {
	List<RecipeCard> getAllCards();
	List<RecipeCard> getAllCardsSortedByRating();

    Optional<RecipeDetails> getRecipeDetails(long id);
}
