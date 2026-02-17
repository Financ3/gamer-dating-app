-- Migration: Convert all existing emails to lowercase for case-insensitive lookups
-- This ensures consistency with the updated authController logic

-- Update all emails in the users table to lowercase
UPDATE users
SET email = LOWER(email);

-- Add a check to prevent future uppercase emails (optional, for data integrity)
-- Note: This won't prevent the application from inserting uppercase,
-- but the application now handles this at the controller level
