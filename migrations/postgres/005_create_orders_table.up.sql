-- Drop old orders table if exists
DROP TABLE IF EXISTS orders CASCADE;

-- Create orders table with new structure
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,

    -- Customer information (stored as JSONB)
    customer JSONB NOT NULL,

    -- Shipping information (stored as JSONB)
    shipping JSONB NOT NULL,

    -- Order items (stored as JSONB array)
    items JSONB NOT NULL,

    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,

    -- Additional information
    notes TEXT,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'mpesa',

    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders((customer->>'email'));
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders((customer->>'phone_number'));

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();
