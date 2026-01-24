-- Cybersecurity Platform Database Schema

CREATE DATABASE IF NOT EXISTS cybersecurity_db;
USE cybersecurity_db;

-- Scan history table
CREATE TABLE IF NOT EXISTS scan_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tool_name VARCHAR(50) NOT NULL,
  target VARCHAR(255) NOT NULL,
  result TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tool_name (tool_name),
  INDEX idx_created_at (created_at)
);

-- Log analysis table
CREATE TABLE IF NOT EXISTS log_analysis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analysis_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
);

-- User activity table (optional, for future use)
CREATE TABLE IF NOT EXISTS user_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45),
  tool_used VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
);
