CREATE DATABASE IF NOT EXISTS employee_db;
USE employee_db;

CREATE TABLE IF NOT EXISTS employees (
  employee_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  address VARCHAR(255) NOT NULL,
  joining_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO employees (name, date_of_birth, gender, phone, email, address, joining_date)
VALUES
  ('Manish Kumar', '1995-03-15', 'Male', '9876543210', 'manishjangra97@gmail.com', 'Hisar, Haryana', '2025-07-01'),
  ('Manish JanGra', '2000-09-22', 'Male', '9876501234', 'mkjangra06@gmail.com', 'Delhi, India', '2025-08-12'),
ON DUPLICATE KEY UPDATE email = VALUES(email);
