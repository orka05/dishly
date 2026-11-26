CREATE TABLE IF NOT EXISTS user_ingredients (
    user_id bigint NOT NULL REFERENCES app_users ON DELETE CASCADE,
    ingredient_id bigint NOT NULL REFERENCES ingredients ON DELETE CASCADE,
    PRIMARY KEY (user_id, ingredient_id)
);
