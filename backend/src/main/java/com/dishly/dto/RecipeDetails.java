package com.dishly.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record RecipeDetails(
        long id,
        String title,
        String description,
        String coverImagePath,
        int totalMinutes,
        int servings,
        BigDecimal averageRating,
        long ratingCount,
        OffsetDateTime createdAt,
        List<Ingredient> ingredients,
        List<Step> steps
) {
    public record Ingredient(
            long id,
            int position,
            String name,
            BigDecimal quantity,
            String unitCode,
            String unit,
            String notes
    ) {}

    public record Step(
            int position,
            String title,
            String instructions,
            String preparationTypeCode,
            Integer durationMinutes
    ) {}
}
