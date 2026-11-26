-- Run after schema.sql against a development database.
BEGIN;

INSERT INTO app_users (username, email, password_hash, activated_at)
VALUES
    ('dishly_demo_author', 'author@dishly.demo.test', '!demo-account!', now()),
    ('dishly_demo_reviewer_1', 'reviewer1@dishly.demo.test', '!demo-account!', now()),
    ('dishly_demo_reviewer_2', 'reviewer2@dishly.demo.test', '!demo-account!', now()),
    ('dishly_demo_reviewer_3', 'reviewer3@dishly.demo.test', '!demo-account!', now())
ON CONFLICT DO NOTHING;

CREATE TEMP TABLE demo_recipes (
    title text PRIMARY KEY,
    image text NOT NULL,
    meal_type text NOT NULL,
    dish_type text NOT NULL,
    diet_type text NOT NULL,
    servings integer NOT NULL,
    minutes integer NOT NULL,
    days_ago integer NOT NULL,
    story text NOT NULL,
    ingredient_names text[] NOT NULL,
    ratings smallint[] NOT NULL
) ON COMMIT DROP;

INSERT INTO demo_recipes VALUES
    ('Lemon Chicken & Orzo', 'lemon-chicken-orzo-unranked.png', 'DINNER', 'PASTA', 'NON_FASTING', 2, 30, 4,
     'Golden chicken and tender orzo in a bright lemon sauce, finished with spinach and Parmesan.',
     ARRAY['Boneless chicken breast','Orzo','Chicken stock','Lemon','Garlic','Olive oil','Parmesan','Baby spinach'],
     ARRAY[5,5,5]),
    ('Roasted Pumpkin Soup', 'roasted-pumpkin-soup-unranked.png', 'LUNCH', 'SOUP', 'VEGETARIAN', 4, 35, 11,
     'Roasted pumpkin blended into a creamy soup.',
     ARRAY['Pumpkin','Garlic','Olive oil','Cream'], ARRAY[5,5,4]),
    ('Mediterranean Grain Bowl', 'mediterranean-grain-bowl-unranked.png', 'LUNCH', 'VEGETABLE', 'VEGAN', 2, 25, 6,
     'Quinoa with fresh vegetables, chickpeas and lemon dressing.',
     ARRAY['Quinoa','Chickpeas','Cherry tomatoes','Cucumber','Lemon','Olive oil'], ARRAY[5,4,5]),
    ('Creamy Tomato Pasta', 'creamy-tomato-pasta.png', 'DINNER', 'PASTA', 'NON_FASTING', 2, 20, 1,
     'Pasta tossed with a tomato and cream sauce.',
     ARRAY['Pasta','Cherry tomatoes','Garlic','Cream','Parmesan'], ARRAY[4,5,4]),
    ('Salmon & Avocado Bowl', 'salmon-avocado-bowl.png', 'LUNCH', 'FISH', 'PESCATARIAN', 2, 25, 7,
     'A bowl of quinoa, salmon and sliced avocado.',
     ARRAY['Salmon','Avocado','Quinoa','Lemon'], ARRAY[4,4,5]),
    ('Chipotle Shrimp Tacos', 'chipotle-shrimp-tacos.png', 'DINNER', 'SANDWICH', 'PESCATARIAN', 3, 25, 0,
     'Warm tortillas filled with chipotle shrimp and avocado.',
     ARRAY['Shrimp','Tortillas','Chipotle','Avocado'], ARRAY[5,4,4]),
    ('Spinach & Ricotta Lasagna', 'spinach-ricotta-lasagna.png', 'DINNER', 'PASTA', 'VEGETARIAN', 4, 55, 2,
     'Baked layers of pasta with spinach and ricotta.',
     ARRAY['Lasagna sheets','Baby spinach','Ricotta','Cherry tomatoes'], ARRAY[4,4,4]),
    ('Berry & Yogurt Granola', 'berry-yogurt-granola.png', 'BREAKFAST', 'VEGETABLE', 'VEGETARIAN', 1, 10, 3,
     'Yogurt topped with berries, banana and crunchy granola.',
     ARRAY['Yogurt','Mixed berries','Banana','Granola'], ARRAY[]::smallint[]);

INSERT INTO recipes (
    author_id, title, meal_type_code, dish_type_code, diet_type_code, servings,
    total_minutes, cover_image_path, story, created_at
)
SELECT author.id, demo.title, demo.meal_type, demo.dish_type, demo.diet_type, demo.servings,
       demo.minutes, '/dishly/home/' || demo.image, demo.story,
       now() - make_interval(days => demo.days_ago)
FROM demo_recipes demo
JOIN app_users author ON author.email = 'author@dishly.demo.test'
                     AND author.username = 'dishly_demo_author'
WHERE NOT EXISTS (
    SELECT 1 FROM recipes existing WHERE existing.author_id = author.id AND existing.title = demo.title
);

CREATE TEMP VIEW demo_saved_recipes AS
SELECT recipe.id, demo.*
FROM demo_recipes demo
JOIN recipes recipe ON recipe.title = demo.title
JOIN app_users author ON author.id = recipe.author_id
                     AND author.email = 'author@dishly.demo.test'
                     AND author.username = 'dishly_demo_author';

INSERT INTO ingredients (name, category_code, default_unit_code)
SELECT seed.name, seed.category, seed.unit
FROM (VALUES
    ('Boneless chicken breast','MEAT','G'), ('Orzo','GRAINS','G'),
    ('Chicken stock','MEAT','ML'), ('Lemon','FRUIT','PCS'), ('Garlic','VEGETABLES','PCS'),
    ('Olive oil','SPICES','ML'), ('Parmesan','DAIRY','G'), ('Baby spinach','VEGETABLES','G'),
    ('Pumpkin','VEGETABLES','G'), ('Cream','DAIRY','ML'), ('Quinoa','GRAINS','G'),
    ('Chickpeas','VEGETABLES','G'), ('Cherry tomatoes','VEGETABLES','G'),
    ('Cucumber','VEGETABLES','PCS'), ('Pasta','GRAINS','G'), ('Salmon','FISH','G'),
    ('Avocado','FRUIT','PCS'), ('Shrimp','FISH','G'), ('Tortillas','GRAINS','PCS'),
    ('Chipotle','SPICES','TSP'), ('Lasagna sheets','GRAINS','G'), ('Ricotta','DAIRY','G'),
    ('Yogurt','DAIRY','G'), ('Mixed berries','FRUIT','G'), ('Banana','FRUIT','PCS'),
    ('Granola','GRAINS','G')
) AS seed(name, category, unit)
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE lower(ingredients.name) = lower(seed.name));

INSERT INTO recipe_ingredients (recipe_id, position, ingredient_id)
SELECT recipe.id, item.position, ingredient.id
FROM demo_saved_recipes recipe
CROSS JOIN LATERAL unnest(recipe.ingredient_names) WITH ORDINALITY AS item(name, position)
JOIN LATERAL (
    SELECT id FROM ingredients WHERE lower(name) = lower(item.name) ORDER BY id LIMIT 1
) ingredient ON true
ON CONFLICT (recipe_id, position) DO NOTHING;

INSERT INTO recipe_steps (recipe_id, position, title, instructions, preparation_type_code, duration_minutes)
SELECT recipe.id, step.position, step.title, step.instructions, step.preparation, step.minutes
FROM demo_saved_recipes recipe
JOIN (VALUES
    ('Lemon Chicken & Orzo', 1, 'Sear the chicken', 'Season and sear the chicken in olive oil until golden. Transfer it to a plate.', 'SAUTE', 8),
    ('Lemon Chicken & Orzo', 2, 'Simmer the orzo', 'Add the garlic, orzo, stock and lemon zest. Simmer until the orzo is tender.', 'BOIL', 12),
    ('Lemon Chicken & Orzo', 3, 'Finish and serve', 'Return the chicken and cook it through. Stir in spinach, Parmesan and lemon juice.', 'SAUTE', 10),
    ('Roasted Pumpkin Soup', 1, 'Roast and blend', 'Roast the pumpkin with garlic and olive oil, then blend with cream.', 'BAKE', 35),
    ('Mediterranean Grain Bowl', 1, 'Assemble the bowl', 'Cook the quinoa, then toss it with chickpeas, diced vegetables, lemon and olive oil.', 'BOIL', 25),
    ('Creamy Tomato Pasta', 1, 'Toss the pasta', 'Cook pasta and toss it with sauteed tomatoes, garlic, cream and Parmesan.', 'BOIL', 20),
    ('Salmon & Avocado Bowl', 1, 'Assemble the bowl', 'Cook the quinoa and salmon. Add avocado and finish with lemon.', 'OTHER', 25),
    ('Chipotle Shrimp Tacos', 1, 'Fill the tacos', 'Cook the shrimp with chipotle and serve in warm tortillas with avocado.', 'SAUTE', 25),
    ('Spinach & Ricotta Lasagna', 1, 'Layer and bake', 'Layer the pasta, ricotta, spinach and tomatoes, then bake until the pasta is tender.', 'BAKE', 55),
    ('Berry & Yogurt Granola', 1, 'Add the toppings', 'Top the yogurt with sliced banana, berries and granola.', 'NO_HEAT', NULL)
) AS step(recipe_title, position, title, instructions, preparation, minutes)
    ON step.recipe_title = recipe.title
ON CONFLICT (recipe_id, position) DO NOTHING;

INSERT INTO recipe_ratings (recipe_id, user_id, stars)
SELECT recipe.id, reviewer.id, rating.stars
FROM demo_saved_recipes recipe
CROSS JOIN LATERAL unnest(recipe.ratings) WITH ORDINALITY AS rating(stars, position)
JOIN app_users reviewer ON reviewer.username = 'dishly_demo_reviewer_' || rating.position
                       AND reviewer.email = 'reviewer' || rating.position || '@dishly.demo.test'
ON CONFLICT (recipe_id, user_id) DO NOTHING;

DROP VIEW demo_saved_recipes;
COMMIT;
