-- Migration: Add public visibility controls
-- Date: 2025-11-08
-- Description: Adds is_public field to groups and sites for guest access control

-- Step 1: Add is_public column to groups (默认值为1，即公开)
ALTER TABLE groups ADD COLUMN is_public INTEGER DEFAULT 1;

-- Step 2: Add is_public column to sites (默认值为1，即公开)
ALTER TABLE sites ADD COLUMN is_public INTEGER DEFAULT 1;

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_groups_is_public ON groups(is_public);
CREATE INDEX IF NOT EXISTS idx_sites_is_public ON sites(is_public);
