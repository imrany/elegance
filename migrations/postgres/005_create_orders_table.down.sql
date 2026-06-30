DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
DROP FUNCTION IF EXISTS update_orders_updated_at();
DROP TABLE IF EXISTS orders CASCADE;
