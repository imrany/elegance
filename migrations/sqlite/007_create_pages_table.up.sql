
-- Create pages table for SQLite
        CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            template TEXT NOT NULL CHECK(template IN ('home', 'about', 'contact', 'custom')),
            status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
            meta_title TEXT,
            meta_description TEXT,
            meta_keywords TEXT,
            og_image TEXT,
            sections TEXT NOT NULL DEFAULT '[]',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            published_at DATETIME
        );

        -- Insert a test page
        -- INSERT OR IGNORE INTO pages (id, title, slug, template, status, sections)
        -- VALUES ('test-page-1', 'Test Page', '/test', 'custom', 'published', '[]');

-- ============================================
-- SEED DEFAULT PAGES (Optional)
-- ============================================

-- Insert default home page
INSERT INTO pages (title, slug, template, status, meta_title, meta_description, sections)
VALUES (
    'Home',
    '/',
    'home',
    'published',
    'Welcome to Our Store',
    'Discover amazing products at great prices',
    '[
        {
            "id": "hero-1",
            "type": "hero",
            "title": "Welcome to Our Store",
            "subtitle": "Discover amazing products at great prices",
            "cta_text": "Shop Now",
            "cta_link": "/products",
            "background_image": "",
            "background_type": "image",
            "overlay": true,
            "overlay_opacity": 0.5,
            "overlay_color": "#000000",
            "text_alignment": "center",
            "height": "large",
            "show_scroll_indicator": true
        },
        {
            "id": "features-1",
            "type": "features",
            "title": "Why Choose Us",
            "subtitle": "Discover what makes us special",
            "layout": "grid",
            "columns": 3,
            "items": [
                {
                    "id": "feature-1",
                    "icon": "ShoppingBag",
                    "title": "Quality Products",
                    "description": "We offer only the best quality products"
                },
                {
                    "id": "feature-2",
                    "icon": "Truck",
                    "title": "Fast Delivery",
                    "description": "Get your orders delivered quickly"
                },
                {
                    "id": "feature-3",
                    "icon": "Shield",
                    "title": "Secure Payments",
                    "description": "Your transactions are always secure"
                }
            ]
        }
    ]'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert default about page
INSERT INTO pages (title, slug, template, status, meta_title, meta_description, sections)
VALUES (
    'About Us',
    '/about',
    'about',
    'draft',
    'About Us - Learn More About Our Story',
    'Learn about our mission, values, and the team behind our store',
    '[
        {
            "id": "about-1",
            "type": "about",
            "title": "About Us",
            "subtitle": "Our Story",
            "description": "We are dedicated to providing the best products and services to our customers.",
            "image": "",
            "image_position": "right",
            "features": [
                "Quality Products",
                "Fast Shipping",
                "Great Support"
            ]
        }
    ]'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert default contact page
INSERT INTO pages (title, slug, template, status, meta_title, meta_description, sections)
VALUES (
    'Contact Us',
    '/contact',
    'contact',
    'draft',
    'Contact Us - Get In Touch',
    'Have questions? Reach out to us and we will get back to you as soon as possible',
    '[
        {
            "id": "contact-1",
            "type": "contact",
            "title": "Get In Touch",
            "subtitle": "We would love to hear from you",
            "show_form": true,
            "show_info": true,
            "email": "hello@example.com",
            "phone": "+1 (555) 123-4567",
            "address": "123 Main St, City, Country",
            "show_map": false,
            "map_url": "",
            "social_links": true
        }
    ]'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ROLLBACK MIGRATION (if needed)
-- ============================================

-- DROP TRIGGER IF EXISTS trigger_pages_updated_at ON pages;
-- DROP INDEX IF EXISTS idx_pages_published_at;
-- DROP INDEX IF EXISTS idx_pages_updated_at;
-- DROP INDEX IF EXISTS idx_pages_created_at;
-- DROP INDEX IF EXISTS idx_pages_template;
-- DROP INDEX IF EXISTS idx_pages_status;
-- DROP INDEX IF EXISTS idx_pages_slug;
-- DROP TABLE IF EXISTS pages;

-- ============================================
-- USEFUL QUERIES FOR TESTING
-- ============================================

-- Get all published pages
-- SELECT * FROM pages WHERE status = 'published' ORDER BY updated_at DESC;

-- Get page by slug
-- SELECT * FROM pages WHERE slug = '/about';

-- Search pages by title (LIKE is case-insensitive by default in SQLite for ASCII characters)
-- SELECT * FROM pages WHERE title LIKE '%about%';

-- Get pages with specific section type (using SQLite JSON functions)
-- This query checks if any section in the 'sections' array has a 'type' property equal to 'hero'.
-- SELECT * FROM pages WHERE EXISTS (SELECT 1 FROM json_each(pages.sections) WHERE json_extract(json_each.value, '$.type') = 'hero');

-- Count pages by status
-- SELECT status, COUNT(*) FROM pages GROUP BY status;

-- Get recently updated pages
-- SELECT id, title, slug, updated_at FROM pages ORDER BY updated_at DESC LIMIT 10;
