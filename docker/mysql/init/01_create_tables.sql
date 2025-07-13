USE delivery_route_db;

CREATE TABLE IF NOT EXISTS delivery_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_number VARCHAR(50),
  customer_name VARCHAR(255),
  customer_code VARCHAR(100),
  address VARCHAR(500),
  sales DECIMAL(10, 2),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- インデックスを追加
CREATE INDEX idx_course_number ON delivery_points(course_number);
CREATE INDEX idx_customer_code ON delivery_points(customer_code);