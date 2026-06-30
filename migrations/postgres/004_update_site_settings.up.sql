-- Update store settings to include description, logo, and announcement
UPDATE site_settings
SET value = jsonb_set(
  jsonb_set(
    jsonb_set(
      value,
      '{description}', '"Curated luxury fashion for the discerning Kenyan. Experience elegance redefined with our exclusive collections."', true
    ),
    '{logo}', '"/logo.png"', true
  ),
  '{announcement}', '"Free Delivery on Orders Over KES 10,000 | Luxury Fashion, Made in Kenya"', true
)
WHERE key = 'store';

-- Insert social media settings
-- Note: Fixed syntax by removing the extra comma before ON CONFLICT
INSERT INTO site_settings (key, value) VALUES
('social_media', '{"facebook": "elegance", "instagram": "elegance", "twitter": "elegance"}')
ON CONFLICT (key) DO NOTHING;
