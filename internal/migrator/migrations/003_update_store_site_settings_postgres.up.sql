-- Update store settings to include description, logo, announcement and social media
UPDATE site_settings
SET value = jsonb_set(
  jsonb_set(value, '{description}', '"Curated luxury fashion for the discerning Kenyan. Experience elegance redefined with our exclusive collections."', true),
  '{logo}', '"/logo.png"', true,
  '{social_media}', '{"facebook": "elegance", "instagram": "elegance", "twitter": "elegance"}', true,
  '{announcement}', '"Free Delivery on Orders Over KES 10,000 | Luxury Fashion, Made in Kenya"', true
)
WHERE key = 'store' AND NOT (value ? 'description');
