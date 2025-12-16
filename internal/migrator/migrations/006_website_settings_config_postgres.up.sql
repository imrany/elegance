-- create website_settings_config table and add default values
CREATE TABLE website_settings_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- insert a unique id
INSERT INTO website_settings_config (key, value) VALUES
('hero', '{ "title": "Welcome to Our Store", "subtitle": "Discover amazing products at great prices", "ctaText": "Shop Now", "ctaLink": "/products", "backgroundImage": "", "overlay": true, "overlayOpacity": 0.5 }'),
('about', '{ "title": "About Us", "description": "We are dedicated to providing the best products and services to our customers.", "image": "", "features": ["Quality Products", "Fast Shipping", "Great Support"] }'),
('features', '{ "title": "Why Choose Us", "subtitle": "Discover what makes us special", "items": [ { "icon": "ShoppingBag", "title": "Quality Products", "description": "We offer only the best quality products" }, { "icon": "Truck", "title": "Fast Delivery", "description": "Get your orders delivered quickly" }, { "icon": "Shield", "title": "Secure Payments", "description": "Your transactions are always secure" } ] }'),
('contact', '{ "title": "Get In Touch", "subtitle": "We''d love to hear from you", "email": "hello@example.com", "phone": "+1 (555) 123-4567", "address": "123 Main St, City, Country", "showMap": false, "mapUrl": "" }'),
('theme', '{ "primaryColor": "#000000", "secondaryColor": "#666666", "accentColor": "#007bff", "fontFamily": "Inter", "borderRadius": "0.5rem" }'),
('seo', '{ "title": "My Store - Quality Products", "description": "Shop the best products at amazing prices", "keywords": "store, shop, products, ecommerce", "ogImage": "", "favicon": "" }'),
('social', '{ "facebook": "", "twitter": "", "instagram": "", "linkedin": "", "youtube": "", "tiktok": "", "whatsapp": { "number": "+1234567890", "message": "Hello! I am interested in your products." } }'),
('store', '{"name": "ÉLÉGANCE", "currency": "KES", "free_delivery_threshold": 10000, "logo": "/logo.png", "announcement": "Free Delivery on Orders Over KES 10,000 | Luxury Fashion, Made in Kenya", "description": "Discover the finest luxury fashion in Kenya, crafted with passion and precision."}'),
('smtp', '{"enabled": false, "from_email": "", "resend_api_key": ""}')
ON CONFLICT (key) DO NOTHING;
