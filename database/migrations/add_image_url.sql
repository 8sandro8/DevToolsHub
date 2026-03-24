-- Migration: Add image_url column to tool table
-- Date: 2026-03-24
-- Description: Adds image_url column to support image uploads for tools

ALTER TABLE tool ADD COLUMN image_url TEXT DEFAULT NULL;
