-- Sample database: a small online shop.
-- Loaded into Postgres (PGlite) in the visitor's browser by the SQL tutorial pages.

CREATE TABLE customers (
  customer_id  integer PRIMARY KEY,
  first_name   text NOT NULL,
  last_name    text NOT NULL,
  email        text NOT NULL UNIQUE,
  city         text NOT NULL,
  state        text NOT NULL,
  signed_up    date NOT NULL
);

CREATE TABLE categories (
  category_id  integer PRIMARY KEY,
  name         text NOT NULL UNIQUE
);

CREATE TABLE products (
  product_id   integer PRIMARY KEY,
  name         text NOT NULL,
  category_id  integer NOT NULL REFERENCES categories (category_id),
  price        numeric(10, 2) NOT NULL,
  in_stock     integer NOT NULL DEFAULT 0
);

CREATE TABLE orders (
  order_id     integer PRIMARY KEY,
  customer_id  integer NOT NULL REFERENCES customers (customer_id),
  ordered_at   date NOT NULL,
  status       text NOT NULL CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled'))
);

CREATE TABLE order_items (
  order_id     integer NOT NULL REFERENCES orders (order_id),
  product_id   integer NOT NULL REFERENCES products (product_id),
  quantity     integer NOT NULL CHECK (quantity > 0),
  unit_price   numeric(10, 2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

INSERT INTO customers VALUES
  (1,  'Avery',   'Nguyen',   'avery.nguyen@example.com',   'Kansas City', 'MO', '2025-01-14'),
  (2,  'Jordan',  'Patel',    'jordan.patel@example.com',   'Overland Park', 'KS', '2025-02-03'),
  (3,  'Riley',   'Johnson',  'riley.johnson@example.com',  'Lawrence', 'KS', '2025-02-21'),
  (4,  'Morgan',  'Garcia',   'morgan.garcia@example.com',  'St. Louis', 'MO', '2025-03-09'),
  (5,  'Casey',   'Kim',      'casey.kim@example.com',      'Omaha', 'NE', '2025-03-30'),
  (6,  'Taylor',  'Brown',    'taylor.brown@example.com',   'Kansas City', 'MO', '2025-04-18'),
  (7,  'Jamie',   'Lopez',    'jamie.lopez@example.com',    'Wichita', 'KS', '2025-05-02'),
  (8,  'Quinn',   'Davis',    'quinn.davis@example.com',    'Des Moines', 'IA', '2025-05-27'),
  (9,  'Drew',    'Martinez', 'drew.martinez@example.com',  'Springfield', 'MO', '2025-06-15'),
  (10, 'Skyler',  'Wilson',   'skyler.wilson@example.com',  'Topeka', 'KS', '2025-07-08'),
  (11, 'Reese',   'Anderson', 'reese.anderson@example.com', 'Lincoln', 'NE', '2025-08-19'),
  (12, 'Rowan',   'Thomas',   'rowan.thomas@example.com',   'Kansas City', 'KS', '2025-09-25');

INSERT INTO categories VALUES
  (1, 'Electronics'),
  (2, 'Books'),
  (3, 'Kitchen'),
  (4, 'Outdoors'),
  (5, 'Games');

INSERT INTO products VALUES
  (1,  'Wireless Mouse',         1,  24.99, 120),
  (2,  'Mechanical Keyboard',    1,  89.00,  45),
  (3,  'USB-C Hub',              1,  39.50,  80),
  (4,  '27" Monitor',            1, 249.99,  12),
  (5,  'SQL Pocket Guide',       2,  19.99, 200),
  (6,  'Database Design Basics', 2,  34.95,  60),
  (7,  'Sci-Fi Short Stories',   2,  14.50,  75),
  (8,  'Cast Iron Skillet',      3,  42.00,  30),
  (9,  'Pour-Over Coffee Kit',   3,  29.99,  50),
  (10, 'Chef''s Knife',          3,  64.00,  25),
  (11, 'Camping Hammock',        4,  49.95,  40),
  (12, 'Trail Water Bottle',     4,  12.99, 150),
  (13, 'Headlamp',               4,  22.50,   0),
  (14, 'Strategy Board Game',    5,  44.99,  35),
  (15, 'Retro Game Controller',  5,  27.99,  60),
  (16, 'Puzzle (1000 pieces)',   5,  18.00,   0);

INSERT INTO orders VALUES
  (1,  1,  '2025-02-01', 'delivered'),
  (2,  2,  '2025-02-10', 'delivered'),
  (3,  1,  '2025-03-05', 'delivered'),
  (4,  3,  '2025-03-12', 'cancelled'),
  (5,  4,  '2025-03-20', 'delivered'),
  (6,  5,  '2025-04-11', 'delivered'),
  (7,  2,  '2025-04-29', 'delivered'),
  (8,  6,  '2025-05-06', 'delivered'),
  (9,  7,  '2025-05-30', 'shipped'),
  (10, 1,  '2025-06-14', 'delivered'),
  (11, 8,  '2025-06-21', 'delivered'),
  (12, 4,  '2025-07-04', 'delivered'),
  (13, 9,  '2025-07-19', 'cancelled'),
  (14, 6,  '2025-08-02', 'delivered'),
  (15, 2,  '2025-08-23', 'shipped'),
  (16, 10, '2025-09-09', 'delivered'),
  (17, 5,  '2025-09-30', 'delivered'),
  (18, 1,  '2025-10-12', 'shipped'),
  (19, 8,  '2025-10-28', 'pending'),
  (20, 6,  '2025-11-03', 'pending');

INSERT INTO order_items VALUES
  (1,  2,  1,  89.00),
  (1,  1,  1,  24.99),
  (2,  5,  2,  19.99),
  (3,  4,  1, 249.99),
  (3,  3,  1,  39.50),
  (4,  8,  1,  42.00),
  (5,  6,  1,  34.95),
  (5,  5,  1,  19.99),
  (6,  11, 1,  49.95),
  (6,  12, 2,  12.99),
  (7,  14, 1,  44.99),
  (8,  9,  1,  29.99),
  (8,  10, 1,  64.00),
  (9,  15, 2,  27.99),
  (10, 7,  3,  14.50),
  (11, 2,  1,  85.00),
  (11, 1,  2,  24.99),
  (12, 8,  1,  42.00),
  (12, 9,  1,  29.99),
  (13, 4,  1, 249.99),
  (14, 13, 2,  22.50),
  (14, 12, 1,  12.99),
  (15, 6,  1,  34.95),
  (16, 14, 1,  44.99),
  (16, 16, 1,  18.00),
  (17, 3,  1,  39.50),
  (18, 15, 1,  27.99),
  (18, 5,  1,  19.99),
  (19, 11, 1,  49.95),
  (20, 1,  1,  24.99);
