package com.dishly.domain;

import java.time.OffsetDateTime;

public record Recipe(
        long id,
        long authorId,
        String title,
        String mealTypeCode,
        String dishTypeCode,
        String dietTypeCode,
        int servings,
        int totalMinutes,
        String coverImagePath,
        String videoLocation,
        String story,
        Long authorLocationId,
        Long originLocationId,
        Long originalRecipeId,
        String modificationNotes,
        OffsetDateTime createdAt
) {}
