-- update store  site_settings
UPDATE site_settings SET value = '{"name": "ÉLÉGANCE", "currency": "KES", "free_delivery_threshold": 10000}' WHERE key = 'store';

-- Note: SQLite doesn't have jsonb_set, so we'll handle this in the app
