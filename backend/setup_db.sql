-- ============================================================
-- CertVerify — MySQL Database Setup
-- Run: mysql -u root -p < setup_db.sql
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS certverify_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create dedicated user (optional — recommended for production)
-- Change 'your_password' to a strong password
CREATE USER IF NOT EXISTS 'certverify_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON certverify_db.* TO 'certverify_user'@'localhost';
FLUSH PRIVILEGES;

USE certverify_db;

-- ── Tables are created by Django migrations ──────────────────
-- Run after this script:
--   python manage.py makemigrations
--   python manage.py migrate

-- ── Verify setup ─────────────────────────────────────────────
SELECT 'Database certverify_db created successfully!' AS Status;
SHOW DATABASES LIKE 'certverify_db';
