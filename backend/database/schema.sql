BEGIN;

CREATE TABLE locations (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country text CHECK (btrim(country) <> ''),
    region text CHECK (btrim(region) <> ''),
    city text CHECK (btrim(city) <> ''),
    latitude numeric(9,6) CHECK (latitude BETWEEN -90 AND 90),
    longitude numeric(9,6) CHECK (longitude BETWEEN -180 AND 180),
    CHECK (country IS NOT NULL OR region IS NOT NULL OR city IS NOT NULL OR latitude IS NOT NULL),
    CHECK ((latitude IS NULL) = (longitude IS NULL))
);

CREATE TABLE app_users (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username text NOT NULL CHECK (username = btrim(username) AND username <> '' AND username NOT LIKE '%@%'),
    email text NOT NULL CHECK (email = btrim(email) AND email ~ '^[^[:space:]@]+@[^[:space:]@]+$'),
    password_hash text NOT NULL CHECK (btrim(password_hash) <> ''),
    role text NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    activated_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    avatar_path text,
    location_id bigint REFERENCES locations,
    bio text
);
CREATE UNIQUE INDEX app_users_username_uq ON app_users (lower(username));
CREATE UNIQUE INDEX app_users_email_uq ON app_users (lower(email));

CREATE TABLE account_tokens (
    token_hash bytea PRIMARY KEY CHECK (octet_length(token_hash) = 32),
    user_id bigint NOT NULL REFERENCES app_users ON DELETE CASCADE,
    purpose text NOT NULL CHECK (purpose IN ('ACTIVATION', 'PASSWORD_RESET')),
    expires_at timestamptz NOT NULL,
    used_at timestamptz
);
CREATE INDEX account_tokens_user_idx ON account_tokens (user_id, purpose);

CREATE TABLE meal_types (code text PRIMARY KEY, name text NOT NULL UNIQUE);
CREATE TABLE dish_types (code text PRIMARY KEY, name text NOT NULL UNIQUE);
CREATE TABLE diet_types (code text PRIMARY KEY, name text NOT NULL UNIQUE);
CREATE TABLE preparation_types (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE
);
CREATE TABLE ingredient_categories (code text PRIMARY KEY, name text NOT NULL UNIQUE);
CREATE TABLE measurement_units (code text PRIMARY KEY, name text NOT NULL UNIQUE);
CREATE TABLE allergens (code text PRIMARY KEY, name text NOT NULL UNIQUE);

CREATE TABLE ingredients (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL CHECK (btrim(name) <> ''),
    category_code text NOT NULL REFERENCES ingredient_categories,
    default_unit_code text NOT NULL REFERENCES measurement_units,
    brand text CHECK (btrim(brand) <> '')
);
CREATE TABLE ingredient_allergens (
    ingredient_id bigint NOT NULL REFERENCES ingredients ON DELETE CASCADE,
    allergen_code text NOT NULL REFERENCES allergens,
    PRIMARY KEY (ingredient_id, allergen_code)
);

CREATE TABLE recipes (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author_id bigint NOT NULL REFERENCES app_users,
    title text NOT NULL CHECK (btrim(title) <> ''),
    meal_type_code text NOT NULL REFERENCES meal_types,
    dish_type_code text NOT NULL REFERENCES dish_types,
    diet_type_code text NOT NULL REFERENCES diet_types,
    servings integer NOT NULL CHECK (servings > 0),
    total_minutes integer NOT NULL CHECK (total_minutes > 0),
    cover_image_path text NOT NULL CHECK (btrim(cover_image_path) <> ''),
    video_location text,
    story text,
    author_location_id bigint REFERENCES locations,
    origin_location_id bigint REFERENCES locations,
    original_recipe_id bigint REFERENCES recipes ON DELETE SET NULL,
    modification_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (original_recipe_id <> id)
);
CREATE INDEX recipes_recent_idx ON recipes (created_at DESC, id DESC);
CREATE INDEX recipes_author_idx ON recipes (author_id);
CREATE INDEX recipes_author_location_idx ON recipes (author_location_id);
CREATE INDEX recipes_origin_location_idx ON recipes (origin_location_id);

CREATE FUNCTION capture_recipe_author_location() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    SELECT location_id INTO NEW.author_location_id
    FROM app_users WHERE id = NEW.author_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER recipes_capture_author_location
BEFORE INSERT ON recipes
FOR EACH ROW EXECUTE FUNCTION capture_recipe_author_location();

CREATE TABLE recipe_ingredients (
    recipe_id bigint NOT NULL REFERENCES recipes ON DELETE CASCADE,
    position integer NOT NULL CHECK (position > 0),
    ingredient_id bigint NOT NULL REFERENCES ingredients,
    quantity numeric(12,3) CHECK (quantity > 0),
    unit_code text REFERENCES measurement_units,
    notes text,
    PRIMARY KEY (recipe_id, position),
    CHECK ((quantity IS NULL) = (unit_code IS NULL))
);

CREATE TABLE recipe_images (
    recipe_id bigint NOT NULL REFERENCES recipes ON DELETE CASCADE,
    position integer NOT NULL CHECK (position > 0),
    image_path text NOT NULL CHECK (btrim(image_path) <> ''),
    PRIMARY KEY (recipe_id, position)
);

CREATE TABLE recipe_steps (
    recipe_id bigint NOT NULL REFERENCES recipes ON DELETE CASCADE,
    position integer NOT NULL CHECK (position > 0),
    title text,
    instructions text NOT NULL CHECK (btrim(instructions) <> ''),
    preparation_type_code text NOT NULL REFERENCES preparation_types,
    duration_minutes integer CHECK (duration_minutes > 0),
    PRIMARY KEY (recipe_id, position),
    CHECK (duration_minutes IS NOT NULL OR preparation_type_code IN ('NO_HEAT', 'OTHER'))
);

CREATE TABLE recipe_step_images (
    recipe_id bigint NOT NULL,
    step_position integer NOT NULL,
    position integer NOT NULL CHECK (position > 0),
    image_path text NOT NULL CHECK (btrim(image_path) <> ''),
    PRIMARY KEY (recipe_id, step_position, position),
    FOREIGN KEY (recipe_id, step_position) REFERENCES recipe_steps ON DELETE CASCADE
);

CREATE TABLE recipe_ratings (
    recipe_id bigint NOT NULL REFERENCES recipes ON DELETE CASCADE,
    user_id bigint NOT NULL REFERENCES app_users ON DELETE CASCADE,
    stars smallint NOT NULL CHECK (stars BETWEEN 1 AND 5),
    PRIMARY KEY (recipe_id, user_id)
);

CREATE VIEW recipe_allergens AS
SELECT DISTINCT ri.recipe_id, a.code AS allergen_code, a.name AS allergen_name
FROM recipe_ingredients ri
JOIN ingredient_allergens ia ON ia.ingredient_id = ri.ingredient_id
JOIN allergens a ON a.code = ia.allergen_code;

CREATE VIEW recipe_cards AS
SELECT r.id, r.title, r.author_id, u.username AS author_username,
       mt.name AS meal_type, dt.name AS dish_type, diet.name AS diet_type,
       r.servings, r.total_minutes, r.cover_image_path, r.created_at,
       coalesce(a.allergen_names, ARRAY[]::text[]) AS allergens,
       rr.average_rating, coalesce(rr.rating_count, 0) AS rating_count
FROM recipes r
JOIN app_users u ON u.id = r.author_id
JOIN meal_types mt ON mt.code = r.meal_type_code
JOIN dish_types dt ON dt.code = r.dish_type_code
JOIN diet_types diet ON diet.code = r.diet_type_code
LEFT JOIN (
    SELECT recipe_id, round(avg(stars), 2) AS average_rating, count(*) AS rating_count
    FROM recipe_ratings GROUP BY recipe_id
) rr ON rr.recipe_id = r.id
LEFT JOIN (
    SELECT recipe_id, array_agg(allergen_name ORDER BY allergen_name) AS allergen_names
    FROM recipe_allergens GROUP BY recipe_id
) a ON a.recipe_id = r.id;

INSERT INTO meal_types VALUES
    ('BREAKFAST', 'Doručak'), ('LUNCH', 'Ručak'), ('DINNER', 'Večera'), ('MAIN', 'Glavna jela'),
    ('APPETIZER', 'Predjela'), ('SALAD', 'Salate'), ('DESSERT', 'Deserti'), ('DRINK', 'Pića');
INSERT INTO dish_types VALUES
    ('SOUP', 'Supa'), ('STEW', 'Čorba'), ('PASTA', 'Testenina'), ('PIZZA', 'Pica'),
    ('SANDWICH', 'Sendvič'), ('BURGER', 'Burger'), ('RISOTTO', 'Rižoto'), ('MEAT', 'Jelo od mesa'),
    ('FISH', 'Jelo od ribe'), ('VEGETABLE', 'Jelo od povrća'), ('BAKERY', 'Pekarski proizvod'),
    ('CAKE', 'Kolač'), ('LAYER_CAKE', 'Torta'), ('PANCAKES', 'Palačinke');
INSERT INTO diet_types VALUES
    ('VEGETARIAN', 'Vegetarijanska'), ('VEGAN', 'Veganska'), ('FASTING', 'Posna'),
    ('NON_FASTING', 'Mrsna'), ('CHRONO', 'Hrono'), ('PESCATARIAN', 'Pesketarijanska');
INSERT INTO preparation_types VALUES
    ('BOIL', 'Kuvanje'), ('BAKE', 'Pečenje'), ('FRY', 'Prženje'), ('SAUTE', 'Dinstanje'),
    ('GRILL', 'Grilovanje'), ('BREAD', 'Pohovanje'), ('STEAM', 'Kuvanje na pari'),
    ('NO_HEAT', 'Bez termičke obrade'), ('OTHER', 'Ostalo');
INSERT INTO ingredient_categories VALUES
    ('VEGETABLES', 'Povrće'), ('FRUIT', 'Voće'), ('MEAT', 'Meso'), ('FISH', 'Riba'),
    ('DAIRY', 'Mlečni proizvodi'), ('GRAINS', 'Žitarice'), ('SPICES', 'Začini'),
    ('NUTS', 'Orašasti plodovi');
INSERT INTO measurement_units VALUES
    ('G', 'gram'), ('KG', 'kilogram'), ('ML', 'mililitar'), ('L', 'litar'),
    ('PCS', 'komad'), ('TSP', 'kašičica'), ('TBSP', 'kašika');
INSERT INTO allergens VALUES
    ('MILK', 'Mleko'), ('GLUTEN', 'Gluten'), ('PEANUT', 'Kikiriki');

-- Initial administrator (development password: Admin123). Change it before any real deployment.
INSERT INTO app_users (username, email, password_hash, role, activated_at)
VALUES ('admin', 'admin@dishly.com', '$2a$10$yUTGuN5PK3tAMj5.SMIDK.AiDoML9kJFI1kLuVVWGhZBmoSRRuDW2', 'ADMIN', now())
ON CONFLICT DO NOTHING;

COMMIT;
