package com.dishly.repository;

import java.util.Optional;
import java.util.List;

import com.dishly.domain.Recipe;
import com.dishly.dto.RecipeCard;
import com.dishly.dto.RecipeDetails.Ingredient;
import com.dishly.dto.RecipeDetails.Step;

public interface RecipeRepository {
	 public List<Recipe> getAll();
	 public List<RecipeCard> getAllCards();
	 public List<RecipeCard> getCardsSortedByRating();

    Optional<RecipeSummary> findSummaryById(long id);
    List<Ingredient> findIngredientsByRecipeId(long id);
    List<Step> findStepsByRecipeId(long id);

    record RecipeSummary(RecipeCard card, String description) {}
}
