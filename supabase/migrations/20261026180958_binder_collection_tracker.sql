/*
# Binder — collection tracker schema (single-tenant, no auth)

Replaces the previous book-swiper tables (books, swipes) with a collection tracker.

1. Drop old tables
- `swipes` (FK child of books, cascade-safe to drop first)
- `books`

2. New Tables
- `collections`: nestable folders for organizing a collection (e.g. Pokémon → Base Set → Holos).
  - id (uuid, PK)
  - name (text, not null)
  - icon (text, emoji or short label, not null)
  - color (text, hex color string used for generated card faces, not null)
  - parent_id (uuid, self-referential FK → collections.id, nullable; null = top-level)
  - created_at (timestamptz)
- `cards`: individual items inside a collection.
  - id (uuid, PK)
  - collection_id (uuid, FK → collections.id, cascade delete)
  - name (text, not null)
  - set_name (text, nullable)
  - card_number (text, nullable)
  - condition (text, nullable)
  - quantity (int, default 1)
  - value (numeric, default 0)
  - notes (text, nullable)
  - photo_url (text, nullable)
  - created_at (timestamptz)

3. Security
- Enable RLS on both tables.
- Grant CRUD to `anon` + `authenticated` — no sign-in screen, so the anon-key client must read/write.
- Policies are permissive (USING/WITH CHECK true) because this is single-tenant shared data.

4. Seed data
- 3 top-level collections: Pokémon, Magic: The Gathering, Baseball Cards.
- 2 subcollections under Pokémon: Base Set, Holos.
- A few sample cards in each.

5. Notes
- `parent_id` self-reference lets collections nest to any depth.
- Card values are stored as numeric for accurate summing.
*/

DROP TABLE IF EXISTS swipes;
DROP TABLE IF EXISTS books;

CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT '📦',
  color text NOT NULL DEFAULT '#6366f1',
  parent_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON collections TO anon, authenticated;

DROP POLICY IF EXISTS "read_collections" ON collections;
CREATE POLICY "read_collections" ON collections FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_collections" ON collections;
CREATE POLICY "insert_collections" ON collections FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_collections" ON collections;
CREATE POLICY "update_collections" ON collections FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_collections" ON collections;
CREATE POLICY "delete_collections" ON collections FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  name text NOT NULL,
  set_name text DEFAULT '',
  card_number text DEFAULT '',
  condition text DEFAULT 'Near Mint',
  quantity int NOT NULL DEFAULT 1,
  value numeric(10,2) NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  photo_url text DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON cards TO anon, authenticated;

DROP POLICY IF EXISTS "read_cards" ON cards;
CREATE POLICY "read_cards" ON cards FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_cards" ON cards;
CREATE POLICY "insert_cards" ON cards FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_cards" ON cards;
CREATE POLICY "update_cards" ON cards FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_cards" ON cards;
CREATE POLICY "delete_cards" ON cards FOR DELETE
  TO anon, authenticated USING (true);

-- Seed collections
INSERT INTO collections (name, icon, color, parent_id) VALUES
('Pokémon', '⚡', '#fbbf24', NULL),
('Magic: The Gathering', '🃏', '#8b5cf6', NULL),
('Baseball Cards', '⚾', '#ef4444', NULL);

-- Pokémon subcollections
INSERT INTO collections (name, icon, color, parent_id)
SELECT 'Base Set', '🎴', '#f59e0b', id FROM collections WHERE name = 'Pokémon' AND parent_id IS NULL;

INSERT INTO collections (name, icon, color, parent_id)
SELECT 'Holos', '✨', '#ec4899', id FROM collections WHERE name = 'Pokémon' AND parent_id IS NULL;

-- Cards in Pokémon Base Set
INSERT INTO cards (collection_id, name, set_name, card_number, condition, quantity, value, notes)
SELECT c.id, 'Charizard', 'Base Set', '4/102', 'Near Mint', 1, 500.00, 'The holy grail'
FROM collections c WHERE c.name = 'Base Set';

INSERT INTO cards (collection_id, name, set_name, card_number, condition, quantity, value)
SELECT c.id, 'Blastoise', 'Base Set', '2/102', 'Lightly Played', 1, 120.00
FROM collections c WHERE c.name = 'Base Set';

INSERT INTO cards (collection_id, name, set_name, card_number, condition, quantity, value)
SELECT c.id, 'Venusaur', 'Base Set', '3/102', 'Near Mint', 1, 95.00
FROM collections c WHERE c.name = 'Base Set';

-- Cards in Pokémon Holos
INSERT INTO cards (collection_id, name, set_name, card_number, condition, quantity, value)
SELECT c.id, 'Holographic Pikachu', 'Base Set', '25/102', 'Gem Mint', 2, 300.00
FROM collections c WHERE c.name = 'Holos';

INSERT INTO cards (collection_id, name, set_name, card_number, condition, quantity, value)
SELECT c.id, 'Holographic Mewtwo', 'Base Set', '10/102', 'Near Mint', 1, 180.00
FROM collections c WHERE c.name = 'Holos';

-- MTG cards
INSERT INTO cards (collection_id, name, set_name, card_number, condition, quantity, value)
SELECT c.id, 'Black Lotus', 'Alpha', '1/1', 'Gem Mint', 1, 60000.00
FROM collections c WHERE c.name = 'Magic: The Gathering' AND parent_id IS NULL;

INSERT INTO cards (collection_id, name, set_name, card_number, condition, quantity, value)
SELECT c.id, 'Lightning Bolt', 'Alpha', '161/295', 'Near Mint', 4, 35.00
FROM collections c WHERE c.name = 'Magic: The Gathering' AND parent_id IS NULL;

-- Baseball cards
INSERT INTO cards (collection_id, name, set_name, card_number, condition, quantity, value)
SELECT c.id, '1952 Mickey Mantle', 'Topps', '#311', 'Near Mint', 1, 12500.00
FROM collections c WHERE c.name = 'Baseball Cards' AND parent_id IS NULL;

INSERT INTO cards (collection_id, name, set_name, card_number, condition, quantity, value)
SELECT c.id, '1989 Ken Griffey Jr.', 'Upper Deck', '#1', 'Gem Mint', 1, 85.00
FROM collections c WHERE c.name = 'Baseball Cards' AND parent_id IS NULL;
