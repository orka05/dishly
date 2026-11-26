package com.dishly.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record RecipeCard(
        long id,
        String title,
        String coverImagePath,
        int totalMinutes,
        int servings,
        BigDecimal averageRating,
        long ratingCount,
        OffsetDateTime createdAt
) {}
