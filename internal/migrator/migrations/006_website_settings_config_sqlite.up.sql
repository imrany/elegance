CREATE TABLE website_settings_config (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL DEFAULT '{}',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert values using snake_case keys to match Go/TypeScript logic
INSERT INTO website_settings_config (key, value) VALUES
('hero', '{ "title": "Welcome to Our Store", "subtitle": "Discover amazing products at great prices", "cta_text": "Shop Now", "cta_link": "/products", "background_image": "", "overlay": true, "overlay_opacity": 0.5 }'),
('about', '{ "title": "About Us", "description": "We are dedicated to providing the best products and services to our customers.", "image": "", "features": ["Quality Products", "Fast Shipping", "Great Support"] }'),
('features', '{ "title": "Why Choose Us", "subtitle": "Discover what makes us special", "items": [ { "icon": "ShoppingBag", "title": "Quality Products", "description": "We offer only the best quality products" }, { "icon": "Truck", "title": "Fast Delivery", "description": "Get your orders delivered quickly" }, { "icon": "Shield", "title": "Secure Payments", "description": "Your transactions are always secure" } ] }'),
('contact', '{ "title": "Get In Touch", "subtitle": "We''d love to hear from you", "email": "hello@example.com", "phone": "+1 (555) 123-4567", "address": "123 Main St, City, Country", "show_map": false, "map_url": "" }'),
('theme', '{ "primary_color": "#000000", "secondary_color": "#666666", "accent_color": "#007bff", "font_family": "Inter", "border_radius": "0.5rem" }'),
('seo', '{ "title": "My Store - Quality Products", "description": "Shop the best products at amazing prices", "keywords": "store, shop, products, ecommerce", "og_image": "", "favicon": "" }'),
('social', '{ "facebook": "", "twitter": "", "instagram": "", "linkedin": "", "youtube": "", "tiktok": "" }'),
('store', '{"name": "ÉLÉGANCE", "currency": "KES", "free_delivery_threshold": 10000, "logo": "/logo.png", "announcement": "Free Delivery on Orders Over KES 10,000 | Luxury Fashion, Made in Kenya", "description": "Discover the finest luxury fashion in Kenya, crafted with passion and precision."}'),
('smtp', '{"enabled": false, "from_email": "", "resend_api_key": ""}'),
('whatsapp', '{"phone": "+254700000000", "message": "Hello! I am interested in your products."}')
ON CONFLICT (key) DO NOTHING;
