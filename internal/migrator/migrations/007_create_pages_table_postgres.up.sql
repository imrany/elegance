-- Create pages table for PostgreSQL
CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    template VARCHAR(50) NOT NULL CHECK(template IN ('home', 'about', 'contact', 'custom')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    og_image VARCHAR(500),
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    published_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_template ON pages(template);
CREATE INDEX IF NOT EXISTS idx_pages_updated_at ON pages(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_sections ON pages USING GIN (sections);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS trigger_pages_updated_at ON pages;
CREATE TRIGGER trigger_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_pages_updated_at();

-- Insert default home page
INSERT INTO pages (
    id,
    title,
    slug,
    template,
    status,
    meta_title,
    meta_description,
    sections
) VALUES (
    'home-page-default',
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
        }
    ]'::jsonb
) ON CONFLICT (slug) DO NOTHING;
