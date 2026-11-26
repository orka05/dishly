package com.dishly.dto;

import java.util.List;

public record PantryRecipes(List<Ingredient> ingredients, List<RecipeCard> recipes) {
    public record Ingredient(long id, String name) {}
}
