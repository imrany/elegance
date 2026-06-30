-- Drop indexes
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_categories_slug;
DROP INDEX IF EXISTS idx_products_slug;
DROP INDEX IF EXISTS idx_products_featured;
DROP INDEX IF EXISTS idx_products_category;

-- Drop tables
DROP TABLE IF EXISTS site_settings;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
