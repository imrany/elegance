-- Update store settings to include description, logo, announcement and social media
UPDATE site_settings
SET value = jsonb_delete(
  jsonb_delete(
    jsonb_delete(
      jsonb_delete(
        jsonb_delete(value, '{description}', true),
        '{logo}', true
      ),
      '{social_media}', true
    ),
    '{announcement}', true
  ),
  '{description}', true
)
WHERE key = 'store' AND NOT (value ? 'description');
