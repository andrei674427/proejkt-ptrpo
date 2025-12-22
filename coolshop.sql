CREATE DATABASE CoolShop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE CoolShop;

-- Таблица пользователей
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('user','admin') DEFAULT 'user'
);

-- Таблица товаров
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  price DECIMAL(10,2),
  image VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заказов
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Таблица товаров в заказе
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Пример админа (пароль '12345')
INSERT INTO users (username,email,password,role) VALUES 
('Admin','admin@coolshop.kz','$2y$10$z5Vd1YhULlO5uzDRl1C4iO0Y0N.1C7KaEvE9bRjzqLeqOzX9y1Tly','admin');

-- Пример товаров
INSERT INTO products (name,price,image,description) VALUES
('Антистресс-банан',3500,'images/banan.jpg','Мягкий антистресс-банан'),
('Кружка Lego',4200,'images/lego.jpg','Весёлая кружка Lego'),
('Карандаши цветные',200,'images/karandsh.jpg','Набор цветных карандашей'),
('Стакан для ручек',200,'images/ruchka.jpg','Прозрачный стакан для ручек');
