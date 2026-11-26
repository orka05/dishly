package com.dishly.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dishly.dto.PantryRecipes;
import com.dishly.dto.RecipeCard;
import com.dishly.dto.RecipeDetails;
import com.dishly.repository.RecipeRepository;

@Service
public class RecepieServiceImplementation implements RecipeService {
	
	@Autowired
	RecipeRepository recipeRepository;
	
	
	// Returns list of DTO objects for recipe cards sorted by creation date descending
	@Override
	public List<RecipeCard> getAllCards() {
		return recipeRepository.getAllCards();
	}
	
	// Returns list of recipe cards objects sorted by average rating descending
	@Override
	public List<RecipeCard> getAllCardsSortedByRating(){
		return recipeRepository.getCardsSortedByRating();
	}

    @Override
    @Transactional(readOnly = true)
    public Optional<RecipeDetails> getRecipeDetails(long id) {
        return recipeRepository.findSummaryById(id).map(summary -> {
            RecipeCard card = summary.card();
            return new RecipeDetails(
                    card.id(),
                    card.title(),
                    summary.description(),
                    card.coverImagePath(),
                    card.totalMinutes(),
                    card.servings(),
                    card.averageRating(),
                    card.ratingCount(),
                    card.createdAt(),
                    recipeRepository.findIngredientsByRecipeId(id),
                    recipeRepository.findStepsByRecipeId(id)
            );
        });
    }

    @Override
    @Transactional(readOnly = true)
    public PantryRecipes getPantryRecipes(long userId) {
        return new PantryRecipes(
                recipeRepository.findUserIngredients(userId),
                recipeRepository.findCardsByUserIngredients(userId)
        );
    }
}
