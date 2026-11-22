/*
 * SQL tutorials. Each page runs a real Postgres database in the visitor's browser.
 *
 * ── Adding a database ──────────────────────────────────────────────────────
 * 1. Save a .sql script in public/sql/ that creates the tables and inserts the data.
 *    From an existing Postgres database:
 *      pg_dump --inserts --no-owner --no-privileges mydb > public/sql/mydb.sql
 *    (--inserts matters: PGlite can't read the default COPY ... FROM stdin format.)
 * 2. Add it to `databases` below.
 *
 * ── Adding a tutorial ──────────────────────────────────────────────────────
 * Add an entry to `sqlTutorials`. Each step can have:
 *   heading   section title
 *   text      paragraphs; wrap code in `backticks`
 *   task      an exercise prompt, shown above the editor
 *   query     starting SQL in the editor (leave out for a text-only step)
 *   solution  SQL that gives the right answer; adds "Check my answer" and "Show solution"
 *   ordered   true if row order matters when checking (default: any order)
 * Queries on a page share one database, so later steps see earlier changes.
 */

export const databases = [
  {
    name: 'shop',
    title: 'Online shop',
    description: 'Customers, products, categories, orders, and order items for a small online store.',
    file: '/sql/shop.sql',
  },
]

export const sqlTutorials = [
  {
    slug: 'select-basics',
    title: 'SELECT basics',
    level: 'Beginner',
    database: 'shop',
    description: 'Pull rows and columns out of a table, filter them with WHERE, sort with ORDER BY, and cap the results with LIMIT.',
    steps: [
      {
        heading: 'Your first query',
        text: [
          'Every query starts with `SELECT` (which columns you want) and `FROM` (which table they live in). `*` means every column.',
          'Press Run (or Ctrl+Enter) to see every customer in the shop.',
        ],
        query: 'SELECT *\nFROM customers;',
      },
      {
        heading: 'Pick your columns',
        text: [
          'In real code, list the columns you need instead of using `*`. It makes the query easier to read, and it won\'t break or slow down when someone adds a column later.',
        ],
        query: 'SELECT first_name, last_name, city\nFROM customers;',
      },
      {
        heading: 'Filter with WHERE',
        text: [
          '`WHERE` keeps only the rows that match a condition. Text values go in single quotes. Combine conditions with `AND` and `OR`.',
        ],
        query: "SELECT first_name, last_name, city\nFROM customers\nWHERE state = 'KS';",
      },
      {
        heading: 'Sort and limit',
        text: [
          '`ORDER BY` sorts the results (`DESC` for largest first), and `LIMIT` caps how many rows come back. Without `ORDER BY`, Postgres can return rows in any order it likes.',
        ],
        query: 'SELECT name, price\nFROM products\nORDER BY price DESC\nLIMIT 5;',
      },
      {
        heading: 'Try it',
        task: 'List the name and price of every product that costs less than $30, cheapest first.',
        query: 'SELECT name, price\nFROM products\n-- your WHERE and ORDER BY here\n;',
        solution: 'SELECT name, price\nFROM products\nWHERE price < 30\nORDER BY price;',
        ordered: true,
      },
    ],
  },
  {
    slug: 'joins',
    title: 'Joining tables',
    level: 'Beginner',
    database: 'shop',
    description: 'Combine rows from related tables with INNER JOIN and LEFT JOIN, and use a LEFT JOIN to find rows with no match.',
    steps: [
      {
        heading: 'Why join?',
        text: [
          'Good database design keeps each fact in one place. An order stores a `customer_id`, not the customer\'s name, so to see who placed each order you join `orders` to `customers` on that shared column.',
        ],
        query:
          'SELECT o.order_id, o.ordered_at, c.first_name, c.last_name\nFROM orders AS o\nJOIN customers AS c ON c.customer_id = o.customer_id\nORDER BY o.order_id;',
      },
      {
        heading: 'Joining more than two tables',
        text: [
          'Joins chain together. Here each order item gets its order date and product name. The short names after `AS` (aliases) keep things readable.',
        ],
        query:
          'SELECT o.order_id, o.ordered_at, p.name, oi.quantity, oi.unit_price\nFROM order_items AS oi\nJOIN orders   AS o ON o.order_id   = oi.order_id\nJOIN products AS p ON p.product_id = oi.product_id\nORDER BY o.order_id, p.name;',
      },
      {
        heading: 'LEFT JOIN keeps everything on the left',
        text: [
          'A plain `JOIN` (an inner join) drops rows that have no match. A `LEFT JOIN` keeps every row from the first table and fills the missing side with `NULL`.',
          'Here every customer shows up, including the ones who have never ordered.',
        ],
        query:
          'SELECT c.first_name, c.last_name, o.order_id\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.customer_id\nORDER BY c.customer_id, o.order_id;',
      },
      {
        heading: 'Try it',
        task: 'Find the customers who have never placed an order. Show their first and last names. Hint: LEFT JOIN, then keep the rows where the order side is NULL.',
        query: 'SELECT c.first_name, c.last_name\nFROM customers AS c\n-- join orders and filter here\n;',
        solution:
          'SELECT c.first_name, c.last_name\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.customer_id\nWHERE o.order_id IS NULL;',
      },
    ],
  },
  {
    slug: 'group-by',
    title: 'Totals with GROUP BY',
    level: 'Intermediate',
    database: 'shop',
    description: 'Summarize data with COUNT, SUM, and AVG, group rows with GROUP BY, and filter groups with HAVING.',
    steps: [
      {
        heading: 'Aggregate functions',
        text: [
          'Aggregate functions boil many rows down to one value: `COUNT`, `SUM`, `AVG`, `MIN`, and `MAX`.',
        ],
        query: 'SELECT COUNT(*) AS products, MIN(price) AS cheapest, MAX(price) AS priciest, ROUND(AVG(price), 2) AS average\nFROM products;',
      },
      {
        heading: 'One row per group',
        text: [
          '`GROUP BY` runs the aggregates once per group instead of once for the whole table. Every column in the `SELECT` must either be in the `GROUP BY` or inside an aggregate.',
        ],
        query:
          'SELECT cat.name AS category, COUNT(*) AS products, ROUND(AVG(p.price), 2) AS avg_price\nFROM products AS p\nJOIN categories AS cat ON cat.category_id = p.category_id\nGROUP BY cat.name\nORDER BY cat.name;',
      },
      {
        heading: 'Filter groups with HAVING',
        text: [
          '`WHERE` filters rows before they are grouped. `HAVING` filters the groups afterwards, so it can use aggregates. This finds customers with more than two orders that weren\'t cancelled.',
        ],
        query:
          "SELECT c.first_name, c.last_name, COUNT(*) AS orders\nFROM orders AS o\nJOIN customers AS c ON c.customer_id = o.customer_id\nWHERE o.status <> 'cancelled'\nGROUP BY c.customer_id, c.first_name, c.last_name\nHAVING COUNT(*) > 2\nORDER BY orders DESC;",
      },
      {
        heading: 'Try it',
        task: 'Show each order\'s total (quantity × unit price, added up), largest first. Return two columns: order_id and total. Leave out cancelled orders.',
        query: 'SELECT oi.order_id, SUM(oi.quantity * oi.unit_price) AS total\nFROM order_items AS oi\n-- join orders, filter, and group here\n;',
        solution:
          "SELECT oi.order_id, SUM(oi.quantity * oi.unit_price) AS total\nFROM order_items AS oi\nJOIN orders AS o ON o.order_id = oi.order_id\nWHERE o.status <> 'cancelled'\nGROUP BY oi.order_id\nORDER BY total DESC, oi.order_id;",
      },
    ],
  },
]
