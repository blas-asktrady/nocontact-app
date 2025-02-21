-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'paid');
CREATE TYPE sender_type AS ENUM ('user', 'ai', 'system');
CREATE TYPE journal_type AS ENUM ('mood', 'gratitude', 'reflection', 'goal', 'custom');
CREATE TYPE content_type AS ENUM ('article', 'video', 'audio', 'exercise');

-- Create tables
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100),
    full_name VARCHAR(255),
    profile_picture_url VARCHAR(255),
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    auth_provider VARCHAR(255) NOT NULL,
    payment_provider VARCHAR(255),
    payment_method VARCHAR(255),
    payment_customer_id VARCHAR(255),
    subscription_tier subscription_tier NOT NULL DEFAULT 'free',
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    allowed_monthly_messages INTEGER NOT NULL DEFAULT 1000,
    messages_used_this_month INTEGER NOT NULL DEFAULT 0,
    is_onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    streak_count INTEGER NOT NULL DEFAULT 0,
    streak_date TIMESTAMP,
    notification_preferences JSONB,
    timezone VARCHAR(50)
);

CREATE TABLE characters (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    avatar_url VARCHAR(255),
    creator_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    font VARCHAR(100),
    prompt_template TEXT,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    voice_id VARCHAR(100),
    personality_traits JSONB,
    specializations TEXT[]
);

CREATE TABLE chats (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    character_id UUID REFERENCES characters(id),
    title VARCHAR(255) NOT NULL,
    llm VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    last_message_preview TEXT,
    context JSONB,
    total_tokens_used INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE messages (
    id UUID PRIMARY KEY,
    chat_id UUID NOT NULL REFERENCES chats(id),
    content TEXT NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    sender_type sender_type NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    audio_url VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    reactions JSONB,
    metadata JSONB
);

CREATE TABLE journals (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    content TEXT NOT NULL,
    journal_type journal_type NOT NULL,
    mood_score INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[],
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    ai_insights TEXT
);

CREATE TABLE content_library (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    content_type content_type NOT NULL,
    duration VARCHAR(50),
    author_name VARCHAR(255),
    author_role VARCHAR(255),
    author_avatar_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    media_url VARCHAR(255),
    tags TEXT[],
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    recommended_for TEXT[]
);

CREATE TABLE user_progress (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    content_id UUID NOT NULL REFERENCES content_library(id),
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_accessed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    favorite BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE user_goals (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    target_date TIMESTAMP,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100),
    reminders JSONB
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notification_type VARCHAR(100) NOT NULL,
    action_url VARCHAR(255),
    related_entity_id UUID,
    related_entity_type VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_journals_user_id ON journals(user_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the update_updated_at trigger to relevant tables
CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_characters
BEFORE UPDATE ON characters
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_chats
BEFORE UPDATE ON chats
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_journals
BEFORE UPDATE ON journals
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_content_library
BEFORE UPDATE ON content_library
FOR EACH ROW EXECUTE FUNCTION update_updated_at();