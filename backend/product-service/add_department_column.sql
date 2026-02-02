-- Add department column to categories table
-- Run this SQL in your Neon database console or via psql

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS department VARCHAR NOT NULL DEFAULT 'Others';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'categories';
