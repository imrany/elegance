-- create push_subscriptions table
CREATE TABLE IF NOT EXISTS webpush_subscriptions (
    endpoint TEXT PRIMARY KEY,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_agent ON webpush_subscriptions(user_agent);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON webpush_subscriptions(endpoint);
