-- create website_settings_config table and add default values
CREATE TABLE website_settings_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert values using snake_case keys to match Go/TypeScript logic
INSERT INTO website_settings_config (key, value) VALUES
('hero', '{ "title": "Welcome to ÉLÉGANCE", "subtitle": "Redefined", "cta_text": "Shop Now", "cta_link": "/products", "background_image": "", "overlay": true, "overlay_opacity": 0.4 }'),
('about', '{ "title": "About Us", "description": "Curated luxury fashion for the discerning Kenyan. Experience elegance redefined with our exclusive collections.", "image": "", "features": ["Quality Products", "Fast Shipping", "Great Support"] }'),
('features', '{ "title": "Why Choose Us", "subtitle": "Discover what makes us special", "items": [ { "icon": "ShoppingBag", "title": "Quality Products", "description": "We offer only the best quality products" }, { "icon": "Truck", "title": "Fast Delivery", "description": "Get your orders delivered quickly" }, { "icon": "Shield", "title": "Secure Payments", "description": "Your transactions are always secure" } ] }'),
('contact', '{ "title": "Get In Touch", "subtitle": "We''d love to hear from you", "email": "hello@example.com", "phone": "+1 (555) 123-4567", "address": "123 Main St, City, Country", "show_map": false, "map_url": "" }'),
('theme', '{ "primary_color": "#000000", "secondary_color": "#ededed", "accent_color": "#CCAA4A", "font_family": "Inter", "border_radius": "0.25rem" }'),
('seo', '{ "title": "My Store - Quality Products", "description": "Shop the best products at amazing prices", "keywords": "store, shop, products, ecommerce", "og_image": "", "favicon": "" }'),
('social', '{ "facebook": "", "twitter": "", "instagram": "", "linkedin": "", "youtube": "", "tiktok": "" }'),
('store', '{"name": "ÉLÉGANCE", "currency": "KES", "free_delivery_threshold": 10000, "logo": "", "announcement": "Free Delivery on Orders Over KES 10,000", "description": "Discover the finest luxury fashion in Kenya, crafted with passion and precision."}'),
('smtp', '{"enabled": false, "from_email": "", "resend_api_key": ""}'),
('whatsapp', '{"phone": "+254700000000", "message": "Hello! I am interested in your products."}'),
('mpesa', '{"type": "till", "phone": "+254700000000", "till_number": "123456", "paybill_number": "", "account_number": ""}')
ON CONFLICT (key) DO NOTHING;
