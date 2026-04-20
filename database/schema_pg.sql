-- PostgreSQL schema for WeeGo Messenger

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    full_name       TEXT        NOT NULL,
    phone           TEXT        NOT NULL UNIQUE,
    email           TEXT        NOT NULL UNIQUE,
    password_hash   TEXT        NOT NULL,
    role            TEXT        NOT NULL DEFAULT 'soldier',
    is_online       BOOLEAN     NOT NULL DEFAULT FALSE,
    last_seen_at    TIMESTAMPTZ DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chats (
    id          SERIAL PRIMARY KEY,
    title       TEXT        NOT NULL,
    is_group    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_by  INTEGER     REFERENCES users(id) ON DELETE SET NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_members (
    id          SERIAL PRIMARY KEY,
    chat_id     INTEGER     NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        TEXT        NOT NULL DEFAULT 'member',
    muted       BOOLEAN     NOT NULL DEFAULT FALSE,
    pinned      BOOLEAN     NOT NULL DEFAULT FALSE,
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id          SERIAL PRIMARY KEY,
    chat_id     INTEGER     NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id   INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body        TEXT        NOT NULL,
    reply_to_id INTEGER     REFERENCES messages(id) ON DELETE SET NULL,
    edited      BOOLEAN     NOT NULL DEFAULT FALSE,
    deleted     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_reads (
    id          SERIAL PRIMARY KEY,
    message_id  INTEGER     NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE TABLE IF NOT EXISTS message_reactions (
    id          SERIAL PRIMARY KEY,
    message_id  INTEGER     NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji       TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE TABLE IF NOT EXISTS calls (
    id          SERIAL PRIMARY KEY,
    chat_id     INTEGER     NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    caller_id   INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    call_type   TEXT        NOT NULL DEFAULT 'audio',
    status      TEXT        NOT NULL DEFAULT 'pending',
    sdp_offer   TEXT        DEFAULT NULL,
    sdp_answer  TEXT        DEFAULT NULL,
    started_at  TIMESTAMPTZ DEFAULT NULL,
    ended_at    TIMESTAMPTZ DEFAULT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint    TEXT        NOT NULL UNIQUE,
    p256dh      TEXT        NOT NULL,
    auth        TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER     REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT        NOT NULL,
    details     TEXT        DEFAULT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Crypto deposits ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crypto_deposit_addresses (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER     NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    address     TEXT        NOT NULL UNIQUE,
    deriv_index INTEGER     NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crypto_deposits (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tx_hash       TEXT        NOT NULL UNIQUE,
    token         TEXT        NOT NULL DEFAULT 'USDT',
    amount_raw    TEXT        NOT NULL,
    amount_usdt   NUMERIC(20,6) NOT NULL,
    confirmations INTEGER     NOT NULL DEFAULT 0,
    status        TEXT        NOT NULL DEFAULT 'pending',
    block_number  INTEGER     NOT NULL,
    credited_at   TIMESTAMPTZ DEFAULT NULL,
    confirmed_at  TIMESTAMPTZ DEFAULT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crypto_deposits_user   ON crypto_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_status ON crypto_deposits(status);
CREATE INDEX IF NOT EXISTS idx_crypto_addr_address    ON crypto_deposit_addresses(address);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token    ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user     ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat     ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender   ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_msg_reads_msg     ON message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_msg_reads_user    ON message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_chat        ON calls(chat_id);

CREATE TABLE IF NOT EXISTS withdrawals (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    amount_usdt     NUMERIC(18,6) NOT NULL,
    address         TEXT    NOT NULL,
    network         TEXT    NOT NULL DEFAULT 'BSC',
    status          TEXT    NOT NULL DEFAULT 'pending',
    tx_hash         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at    TIMESTAMPTZ,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
