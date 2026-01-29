-- Migration: Advanced database indexes for improved performance
-- Date: 2026-01-29
-- Description: Add advanced indexes for complex queries and improve overall database performance

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_groups_order_public;
DROP INDEX IF EXISTS idx_sites_group_order_public;
DROP INDEX IF EXISTS idx_sites_name_url;
DROP INDEX IF EXISTS idx_sites_description;
DROP INDEX IF EXISTS idx_configs_key;
DROP INDEX IF EXISTS idx_sites_group_id_order;

-- Create optimized indexes for better query performance
-- Index for groups table - optimized for common sorting and filtering
CREATE INDEX IF NOT EXISTS idx_groups_order_num ON groups(order_num);

-- Index for groups table - optimized for public/private filtering
CREATE INDEX IF NOT EXISTS idx_groups_is_public ON groups(is_public);

-- Index for sites table - optimized for group association and ordering
CREATE INDEX IF NOT EXISTS idx_sites_group_order ON sites(group_id, order_num);

-- Index for sites table - optimized for public/private filtering
CREATE INDEX IF NOT EXISTS idx_sites_is_public ON sites(is_public);

-- Index for sites table - optimized for name-based searches
CREATE INDEX IF NOT EXISTS idx_sites_name ON sites(name);

-- Index for sites table - optimized for URL-based searches
CREATE INDEX IF NOT EXISTS idx_sites_url ON sites(url);

-- Index for sites table - optimized for name and URL combined searches
CREATE INDEX IF NOT EXISTS idx_sites_name_url_combined ON sites(name, url);

-- Index for configs table - optimized for key-based lookups
CREATE INDEX IF NOT EXISTS idx_configs_key_lookup ON configs(key);

-- Composite index for sites - optimized for the JOIN query in getGroupsWithSites
CREATE INDEX IF NOT EXISTS idx_sites_group_id_order_num ON sites(group_id, order_num);

-- Index for sites table - optimized for text-based searches across multiple fields
CREATE INDEX IF NOT EXISTS idx_sites_full_text_search ON sites(name, description, notes);

-- Optimized composite index for sites - combining group, visibility, and order
CREATE INDEX IF NOT EXISTS idx_sites_group_visibility_order ON sites(group_id, is_public, order_num);

-- Optimized composite index for groups - combining visibility and order
CREATE INDEX IF NOT EXISTS idx_groups_visibility_order ON groups(is_public, order_num);

-- Index for creation timestamps (useful for recent items queries)
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at);
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at);

-- Index for update timestamps (useful for sync and audit operations)
CREATE INDEX IF NOT EXISTS idx_groups_updated_at ON groups(updated_at);
CREATE INDEX IF NOT EXISTS idx_sites_updated_at ON sites(updated_at);