/*
# Binder — books & swipes tables (single-tenant, no auth)

1. New Tables
- `books`: catalog of book cards users swipe through.
  - id (uuid, PK)
  - title (text)
  - author (text)
  - genre (text)
  - description (text)
  - rating (numeric, 0–5)
  - pages (int)
  - year (int, publication year)
  - created_at (timestamp)
- `swipes`: records each swipe action so swiped books leave the deck and liked books appear in the library.
  - id (uuid, PK)
  - book_id (uuid, FK → books, cascade delete)
  - action (text: 'like' or 'pass')
  - created_at (timestamp)

2. Security
- Enable RLS on both tables.
- Grant CRUD to `anon` + `authenticated` — the app has no sign-in screen, so the anon-key client must read/write its own data.
- Policies are intentionally permissive (USING true / WITH CHECK true) because this is a single-tenant app with no user isolation.

3. Notes
- Seed data inserts ~24 books across multiple genres.
- A unique constraint on swipes(book_id) ensures one swipe per book.
*/

CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  genre text NOT NULL,
  description text NOT NULL,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  pages int NOT NULL DEFAULT 0,
  year int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON books TO anon, authenticated;

DROP POLICY IF EXISTS "read_books" ON books;
CREATE POLICY "read_books" ON books FOR SELECT
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('like','pass')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(book_id)
);

ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON swipes TO anon, authenticated;

DROP POLICY IF EXISTS "read_swipes" ON swipes;
CREATE POLICY "read_swipes" ON swipes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_swipes" ON swipes;
CREATE POLICY "insert_swipes" ON swipes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_swipes" ON swipes;
CREATE POLICY "update_swipes" ON swipes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_swipes" ON swipes;
CREATE POLICY "delete_swipes" ON swipes FOR DELETE
  TO anon, authenticated USING (true);

-- Seed books
INSERT INTO books (title, author, genre, description, rating, pages, year) VALUES
('The Midnight Library', 'Matt Haig', 'Fiction', 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.', 4.2, 304, 2020),
('Dune', 'Frank Herbert', 'Sci-Fi', 'A stunning blend of adventure and mysticism, environmentalism and politics, detailing the quest of a young heir to a noble family on a desert planet.', 4.5, 688, 1965),
('The Silent Patient', 'Alex Michaelides', 'Thriller', 'A psychological thriller about a woman who shoots her husband five times and then never speaks another word.', 4.2, 336, 2019),
('Educated', 'Tara Westover', 'Memoir', 'An unforgettable memoir about a young woman who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge.', 4.7, 352, 2018),
('Where the Crawdads Sing', 'Delia Owens', 'Fiction', 'A coming-of-age story of a young girl growing up in the marshes of North Carolina, intertwined with a murder investigation.', 4.5, 384, 2018),
('Project Hail Mary', 'Andy Weir', 'Sci-Fi', 'A lone astronaut must save humanity in this unforgettable sci-fi adventure about isolation, determination, and friendship.', 4.8, 496, 2021),
('The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', 'Fiction', 'An aging Hollywood legend tells the story of her glamorous and scandalous life to an unknown magazine reporter.', 4.6, 400, 2017),
('Atomic Habits', 'James Clear', 'Self-Help', 'An easy and proven way to build good habits and break bad ones, with practical strategies for getting 1% better every day.', 4.5, 320, 2018),
('The Guest List', 'Lucy Foley', 'Thriller', 'A wedding on a remote Irish island turns deadly in this gripping psychological thriller full of secrets and lies.', 4.1, 320, 2020),
('Klara and the Sun', 'Kazuo Ishiguro', 'Sci-Fi', 'From the Nobel Prize-winning author comes the story of Klara, an Artificial Friend with outstanding observational qualities.', 4.0, 320, 2021),
('The Song of Achilles', 'Madeline Miller', 'Fantasy', 'A tender and heartbreaking retelling of the legend of Achilles and the Trojan War through the eyes of his companion Patroclus.', 4.7, 416, 2011),
('Circe', 'Madeline Miller', 'Fantasy', 'The witch Circe, daughter of the sun god, transforms from an awkward nymph into a formidable witch in this mythological epic.', 4.6, 400, 2018),
('Normal People', 'Sally Rooney', 'Fiction', 'Two people from different backgrounds in Ireland navigate the complexities of intimacy and friendship into adulthood.', 3.9, 288, 2018),
('The Power of Now', 'Eckhart Tolle', 'Self-Help', 'A guide to spiritual enlightenment that emphasizes living in the present moment and freeing oneself from the mind.', 4.3, 256, 1997),
('Gone Girl', 'Gillian Flynn', 'Thriller', 'A psychological thriller about a marriage gone terribly wrong, told from both spouses with unreliable narrators.', 4.2, 432, 2012),
('The Alchemist', 'Paulo Coelho', 'Fiction', 'A shepherd boy journeys from Spain to Egypt in search of a treasure, discovering the wisdom of listening to his heart.', 3.9, 208, 1988),
('Pachinko', 'Min Jin Lee', 'Historical', 'A sweeping saga of a Korean family who eventually migrates to Japan, spanning four generations of discrimination and resilience.', 4.5, 496, 2017),
('The Night Circus', 'Erin Morgenstern', 'Fantasy', 'A magical competition between two young illusionists unfolds within a mysterious circus that only opens at night.', 4.3, 387, 2011),
('Sapiens', 'Yuval Noah Harari', 'Non-Fiction', 'A bold and provocative narrative tracing the history of humankind from the dawn of cognition to the modern age.', 4.4, 464, 2011),
('The Secret History', 'Donna Tartt', 'Fiction', 'A close-knit group of classics students at an elite New England college become entangled in a dark and deadly secret.', 4.3, 559, 1992),
('Lessons in Chemistry', 'Bonnie Garmus', 'Fiction', 'A female chemist in the 1960s becomes the host of a beloved TV cooking show, using it to teach women far more than recipes.', 4.5, 400, 2022),
('The House in the Cerulean Sea', 'TJ Klune', 'Fantasy', 'A caseworker for magical youth is sent to evaluate an orphanage and discovers a family he never knew he needed.', 4.6, 396, 2020),
('True Crime Story', 'Joseph Knox', 'Thriller', 'A fictional true-crime investigation that blurs the line between novel and documentary, unraveling a missing student case.', 4.0, 352, 2021),
('Tomorrow, and Tomorrow, and Tomorrow', 'Gabrielle Zevin', 'Fiction', 'Two friends bond over playing games and eventually design a game together, exploring creativity and connection over decades.', 4.5, 416, 2022)
ON CONFLICT DO NOTHING;
