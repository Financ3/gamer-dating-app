-- Migration: Add password reset columns to users table
-- Run date: 2026-02-16
-- Description: Adds reset_token and reset_token_expiry columns for password reset functionality

-- Add reset_token column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'reset_token'
    ) THEN
        ALTER TABLE users ADD COLUMN reset_token TEXT;
        RAISE NOTICE 'Column reset_token added successfully';
    ELSE
        RAISE NOTICE 'Column reset_token already exists';
    END IF;
END $$;

-- Add reset_token_expiry column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'reset_token_expiry'
    ) THEN
        ALTER TABLE users ADD COLUMN reset_token_expiry BIGINT;
        RAISE NOTICE 'Column reset_token_expiry added successfully';
    ELSE
        RAISE NOTICE 'Column reset_token_expiry already exists';
    END IF;
END $$;

-- Verify the columns were added
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('reset_token', 'reset_token_expiry');
