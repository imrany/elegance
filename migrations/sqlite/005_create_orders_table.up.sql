-- Drop old orders table if exists
DROP TABLE IF EXISTS orders;

-- Create orders table with new structure
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,

    -- Customer information (stored as JSON text)
    customer TEXT NOT NULL,

    -- Shipping information (stored as JSON text)
    shipping TEXT NOT NULL,

    -- Order items (stored as JSON array text)
    items TEXT NOT NULL,

    -- Pricing
    subtotal REAL NOT NULL,
    delivery_fee REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,

    -- Additional information
    notes TEXT,
    payment_method TEXT NOT NULL DEFAULT 'mpesa',

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending',
    payment_status TEXT NOT NULL DEFAULT 'pending',

    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create trigger to auto-update updated_at
CREATE TRIGGER IF NOT EXISTS trigger_orders_updated_at
    AFTER UPDATE ON orders
    FOR EACH ROW
BEGIN
    UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
