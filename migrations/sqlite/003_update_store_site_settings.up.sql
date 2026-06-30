-- update store  site_settings
UPDATE site_settings SET value = '{"name": "ÉLÉGANCE", "currency": "KES", "free_delivery_threshold": 10000, "logo": "/logo.png", "description": "Curated luxury fashion for the discerning Kenyan. Experience elegance redefined with our exclusive collections.", "social_media": {"facebook": "elegance", "instagram": "elegance", "twitter": "elegance"}, "announcement": "Free Delivery on Orders Over KES 10,000 | Luxury Fashion, Made in Kenya"}' WHERE key = 'store';

-- Note: SQLite doesn't have jsonb_set, so we'll handle this in the app
