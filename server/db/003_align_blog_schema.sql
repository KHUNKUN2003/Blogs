ALTER TABLE blogs
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS posted_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

UPDATE blogs
SET
  cover_image_url = COALESCE(cover_image_url, ''),
  posted_at = COALESCE(posted_at, created_at, NOW()),
  view_count = COALESCE(view_count, 0)
WHERE cover_image_url IS NULL
  OR posted_at IS NULL
  OR view_count IS NULL;

ALTER TABLE blogs
  ALTER COLUMN cover_image_url SET NOT NULL,
  ALTER COLUMN posted_at SET DEFAULT NOW(),
  ALTER COLUMN posted_at SET NOT NULL,
  ALTER COLUMN view_count SET DEFAULT 0,
  ALTER COLUMN view_count SET NOT NULL;

ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS sender_name TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'comments'
      AND column_name = 'author_name'
  ) THEN
    EXECUTE 'UPDATE comments SET sender_name = COALESCE(sender_name, author_name) WHERE sender_name IS NULL';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'comments'
      AND column_name = 'content'
  ) THEN
    EXECUTE 'UPDATE comments SET message = COALESCE(message, content) WHERE message IS NULL';
  END IF;
END $$;

UPDATE comments
SET
  sender_name = COALESCE(sender_name, 'Anonymous'),
  message = COALESCE(message, '')
WHERE sender_name IS NULL
  OR message IS NULL;

ALTER TABLE comments
  ALTER COLUMN sender_name SET NOT NULL,
  ALTER COLUMN message SET NOT NULL;

DO $$
DECLARE
  legacy_column TEXT;
BEGIN
  FOREACH legacy_column IN ARRAY ARRAY['author_name', 'author_email', 'content']
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'comments'
        AND column_name = legacy_column
    ) THEN
      EXECUTE format('ALTER TABLE comments ALTER COLUMN %I DROP NOT NULL', legacy_column);
    END IF;
  END LOOP;
END $$;
