-- Development only. Run after add-user-ingredients.sql and seed.sql.
-- Both demo accounts use the password DishlyDemo123!
BEGIN;

INSERT INTO app_users (username, email, password_hash, activated_at)
VALUES
    ('dishly_pantry_demo', 'pantry@dishly.demo.test', '$2a$12$NBwj0WSpMjtsJ30PTZUkru/dYBMjpPdHPCcphek8Vq1k/8QTAN.eC', now()),
    ('dishly_breakfast_demo', 'breakfast@dishly.demo.test', '$2a$12$NBwj0WSpMjtsJ30PTZUkru/dYBMjpPdHPCcphek8Vq1k/8QTAN.eC', now())
ON CONFLICT DO NOTHING;

INSERT INTO user_ingredients (user_id, ingredient_id)
SELECT pantry_user.id, ingredient.ingredient_id
FROM (VALUES
    ('dishly_pantry_demo', 'pantry@dishly.demo.test', 'Lemon Chicken & Orzo'),
    ('dishly_pantry_demo', 'pantry@dishly.demo.test', 'Mediterranean Grain Bowl'),
    ('dishly_breakfast_demo', 'breakfast@dishly.demo.test', 'Berry & Yogurt Granola')
) AS demo(username, email, title)
JOIN app_users pantry_user ON pantry_user.username = demo.username AND pantry_user.email = demo.email
JOIN app_users author ON author.username = 'dishly_demo_author' AND author.email = 'author@dishly.demo.test'
JOIN recipes recipe ON recipe.author_id = author.id AND recipe.title = demo.title
JOIN recipe_ingredients ingredient ON ingredient.recipe_id = recipe.id
ON CONFLICT (user_id, ingredient_id) DO NOTHING;

COMMIT;
