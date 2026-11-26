package com.dishly.repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.dishly.domain.Recipe;
import com.dishly.dto.PantryRecipes;
import com.dishly.dto.RecipeCard;
import com.dishly.dto.RecipeDetails.Ingredient;
import com.dishly.dto.RecipeDetails.Step;

@Repository
public class RecipeRepositoryImplementation implements RecipeRepository{

    private final JdbcTemplate jdbcTemplate;

    public RecipeRepositoryImplementation(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Recipe> getAll() {
        return jdbcTemplate.query("""
                SELECT id, author_id, title, meal_type_code, dish_type_code, diet_type_code,
                       servings, total_minutes, cover_image_path, video_location, story,
                       author_location_id, origin_location_id, original_recipe_id,
                       modification_notes, created_at
                FROM recipes
                ORDER BY created_at DESC, id DESC
                """, (row, index) -> new Recipe(
                        row.getLong("id"),
                        row.getLong("author_id"),
                        row.getString("title"),
                        row.getString("meal_type_code"),
                        row.getString("dish_type_code"),
                        row.getString("diet_type_code"),
                        row.getInt("servings"),
                        row.getInt("total_minutes"),
                        row.getString("cover_image_path"),
                        row.getString("video_location"),
                        row.getString("story"),
                        row.getObject("author_location_id", Long.class),
                        row.getObject("origin_location_id", Long.class),
                        row.getObject("original_recipe_id", Long.class),
                        row.getString("modification_notes"),
                        row.getObject("created_at", OffsetDateTime.class)
                ));
    }

    @Override
    public List<RecipeCard> getAllCards() {
        return jdbcTemplate.query("""
                SELECT id, title, cover_image_path, total_minutes, servings,
                       average_rating, rating_count, created_at
                FROM recipe_cards
                ORDER BY created_at DESC, id DESC
                """, (row, index) -> new RecipeCard(
                        row.getLong("id"),
                        row.getString("title"),
                        row.getString("cover_image_path"),
                        row.getInt("total_minutes"),
                        row.getInt("servings"),
                        row.getBigDecimal("average_rating"),
                        row.getLong("rating_count"),
                        row.getObject("created_at", OffsetDateTime.class)
                ));
    }
    
    @Override
    public List<RecipeCard> getCardsSortedByRating(){
    	return jdbcTemplate.query("""
                SELECT id, title, cover_image_path, total_minutes, servings,
                       average_rating, rating_count, created_at
                FROM recipe_cards
                ORDER BY average_rating DESC NULLS LAST, id DESC
                """, (row, index) -> new RecipeCard(
                        row.getLong("id"),
                        row.getString("title"),
                        row.getString("cover_image_path"),
                        row.getInt("total_minutes"),
                        row.getInt("servings"),
                        row.getBigDecimal("average_rating"),
                        row.getLong("rating_count"),
                        row.getObject("created_at", OffsetDateTime.class)
                ));
    }

    @Override
    public Optional<RecipeSummary> findSummaryById(long id) {
        return jdbcTemplate.query("""
                SELECT c.id, c.title, c.cover_image_path, c.total_minutes, c.servings,
                       c.average_rating, c.rating_count, c.created_at, r.story
                FROM recipe_cards c
                JOIN recipes r ON r.id = c.id
                WHERE c.id = ?
                """, (row, index) -> new RecipeSummary(
                        new RecipeCard(
                                row.getLong("id"),
                                row.getString("title"),
                                row.getString("cover_image_path"),
                                row.getInt("total_minutes"),
                                row.getInt("servings"),
                                row.getBigDecimal("average_rating"),
                                row.getLong("rating_count"),
                                row.getObject("created_at", OffsetDateTime.class)
                        ),
                        row.getString("story")
                ), id).stream().findFirst();
    }

    @Override
    public List<Ingredient> findIngredientsByRecipeId(long id) {
        return jdbcTemplate.query("""
                SELECT i.id, ri.position, i.name, ri.quantity, ri.unit_code, u.name AS unit, ri.notes
                FROM recipe_ingredients ri
                JOIN ingredients i ON i.id = ri.ingredient_id
                LEFT JOIN measurement_units u ON u.code = ri.unit_code
                WHERE ri.recipe_id = ?
                ORDER BY ri.position
                """, (row, index) -> new Ingredient(
                        row.getLong("id"),
                        row.getInt("position"),
                        row.getString("name"),
                        row.getBigDecimal("quantity"),
                        row.getString("unit_code"),
                        row.getString("unit"),
                        row.getString("notes")
                ), id);
    }

    @Override
    public List<Step> findStepsByRecipeId(long id) {
        return jdbcTemplate.query("""
                SELECT position, title, instructions, preparation_type_code, duration_minutes
                FROM recipe_steps
                WHERE recipe_id = ?
                ORDER BY position
                """, (row, index) -> new Step(
                        row.getInt("position"),
                        row.getString("title"),
                        row.getString("instructions"),
                        row.getString("preparation_type_code"),
                        row.getObject("duration_minutes", Integer.class)
                ), id);
    }

    @Override
    public List<PantryRecipes.Ingredient> findUserIngredients(long userId) {
        return jdbcTemplate.query("""
                SELECT i.id, i.name
                FROM user_ingredients ui
                JOIN ingredients i ON i.id = ui.ingredient_id
                WHERE ui.user_id = ?
                ORDER BY lower(i.name), i.id
                """, (row, index) -> new PantryRecipes.Ingredient(
                        row.getLong("id"), row.getString("name")
                ), userId);
    }

    @Override
    public List<RecipeCard> findCardsByUserIngredients(long userId) {
        return jdbcTemplate.query("""
                SELECT c.id, c.title, c.cover_image_path, c.total_minutes, c.servings,
                       c.average_rating, c.rating_count, c.created_at
                FROM recipe_cards c
                WHERE EXISTS (
                    SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = c.id
                )
                AND NOT EXISTS (
                    SELECT 1 FROM recipe_ingredients ri
                    WHERE ri.recipe_id = c.id
                    AND NOT EXISTS (
                        SELECT 1 FROM user_ingredients ui
                        WHERE ui.user_id = ? AND ui.ingredient_id = ri.ingredient_id
                    )
                )
                ORDER BY c.average_rating DESC NULLS LAST, c.id DESC
                """, (row, index) -> new RecipeCard(
                        row.getLong("id"),
                        row.getString("title"),
                        row.getString("cover_image_path"),
                        row.getInt("total_minutes"),
                        row.getInt("servings"),
                        row.getBigDecimal("average_rating"),
                        row.getLong("rating_count"),
                        row.getObject("created_at", OffsetDateTime.class)
                ), userId);
    }
}
