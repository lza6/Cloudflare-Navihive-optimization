-- Migration: Optimize database indexes for better performance
-- Date: 2025-04-05
-- Description: Add optimized indexes to improve query performance

-- Drop existing indexes if they exist (to recreate with better names)
DROP INDEX IF EXISTS idx_groups_is_public;
DROP INDEX IF EXISTS idx_sites_is_public;

-- Create optimized indexes for better query performance
-- Index for groups table - covers order_num and is_public for common queries
CREATE INDEX IF NOT EXISTS idx_groups_order_public ON groups(order_num, is_public);

-- Index for sites table - covers group_id, order_num, and is_public for common queries
CREATE INDEX IF NOT EXISTS idx_sites_group_order_public ON sites(group_id, order_num, is_public);

-- Index for sites table - covers name, url for search queries
CREATE INDEX IF NOT EXISTS idx_sites_name_url ON sites(name, url);

-- Index for sites table - covers description for search queries
CREATE INDEX IF NOT EXISTS idx_sites_description ON sites(description);

-- Index for configs table - improve config lookup performance
CREATE INDEX IF NOT EXISTS idx_configs_key ON configs(key);

-- Composite index for sites table - for the optimized join query in getGroupsWithSites
CREATE INDEX IF NOT EXISTS idx_sites_group_id_order ON sites(group_id, order_num);

-- Additional index for faster ID lookups (though primary keys already indexed)
-- These are typically not needed since id columns are primary keys, but adding for completeness
-- CREATE INDEX IF NOT EXISTS idx_groups_id ON groups(id);
-- CREATE INDEX IF NOT EXISTS idx_sites_id ON sites(id);