-- Migration: Add anio column to tool table
-- Date: 2026-04-29
-- Description: Add INTEGER column for year filtering on tools

ALTER TABLE tool ADD COLUMN anio INTEGER;