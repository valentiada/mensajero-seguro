PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name       TEXT    NOT NULL,
    phone           TEXT    NOT NULL UNIQUE,
    email           TEXT    NOT NULL UNIQUE,
    password_hash   TEXT    NOT NULL,
    role            TEXT    NOT NULL DEFAULT 'soldier',
    is_online       INTEGER NOT NULL DEFAULT 0,
    last_seen_at    TEXT    DEFAULT NULL,
    created_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    token       TEXT    NOT NULL UNIQUE,
    expires_at  TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chats (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    is_group    INTEGER NOT NULL DEFAULT 0,
    created_by  INTEGER NOT NULL,
    updated_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chat_members (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id     INTEGER NOT NULL,
    user_id     INTEGER NOT NULL,
    role        TEXT    NOT NULL DEFAULT 'member',
    muted       INTEGER NOT NULL DEFAULT 0,
    pinned      INTEGER NOT NULL DEFAULT 0,
    joined_at   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chat_id, user_id),
    FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id     INTEGER NOT NULL,
    sender_id   INTEGER NOT NULL,
    body        TEXT    NOT NULL,
    reply_to_id INTEGER DEFAULT NULL,
    edited      INTEGER NOT NULL DEFAULT 0,
    deleted     INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(reply_to_id) REFERENCES messages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS message_reads (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id  INTEGER NOT NULL,
    user_id     INTEGER NOT NULL,
    read_at     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id),
    FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS message_reactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id  INTEGER NOT NULL,
    user_id     INTEGER NOT NULL,
    emoji       TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id),
    FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS calls (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id     INTEGER NOT NULL,
    caller_id   INTEGER NOT NULL,
    call_type   TEXT    NOT NULL DEFAULT 'audio',
    status      TEXT    NOT NULL DEFAULT 'pending',
    sdp_offer   TEXT    DEFAULT NULL,
    sdp_answer  TEXT    DEFAULT NULL,
    started_at  TEXT    DEFAULT NULL,
    ended_at    TEXT    DEFAULT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chat_id)   REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY(caller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    endpoint    TEXT    NOT NULL UNIQUE,
    p256dh      TEXT    NOT NULL,
    auth        TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER DEFAULT NULL,
    action      TEXT    NOT NULL,
    details     TEXT    DEFAULT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ── Support chat ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS support_tickets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    chat_id     INTEGER NOT NULL,
    subject     TEXT    NOT NULL DEFAULT 'Звернення до підтримки',
    status      TEXT    NOT NULL DEFAULT 'open',   -- open | in_progress | resolved | closed
    priority    TEXT    NOT NULL DEFAULT 'normal', -- low | normal | high | urgent
    assigned_to INTEGER DEFAULT NULL,
    resolved_at TEXT    DEFAULT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)     REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(chat_id)     REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY(assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- ── Casino ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS casino_wallets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL UNIQUE,
    balance     REAL    NOT NULL DEFAULT 1000.0,  -- стартовий бонус
    total_bet   REAL    NOT NULL DEFAULT 0,
    total_won   REAL    NOT NULL DEFAULT 0,
    level       INTEGER NOT NULL DEFAULT 1,
    xp          INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS casino_games (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    game_type   TEXT    NOT NULL,   -- roulette | slots | blackjack
    bet_amount  REAL    NOT NULL,
    win_amount  REAL    NOT NULL DEFAULT 0,
    result_data TEXT    NOT NULL DEFAULT '{}',  -- JSON
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS casino_achievements (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    achievement_key TEXT    NOT NULL,
    unlocked_at     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_key),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS casino_leaderboard (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL UNIQUE,
    total_won   REAL    NOT NULL DEFAULT 0,
    games_count INTEGER NOT NULL DEFAULT 0,
    updated_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token       ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user        ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user    ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat    ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat        ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender      ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_msg    ON message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user   ON message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_chat           ON calls(chat_id);

-- ── Crypto deposits ───────────────────────────────────────────────────────────

-- One unique BSC deposit address per user (derived from master HD wallet)
CREATE TABLE IF NOT EXISTS crypto_deposit_addresses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL UNIQUE,
    address         TEXT    NOT NULL UNIQUE,   -- 0x... BSC address (checksummed)
    deriv_index     INTEGER NOT NULL UNIQUE,   -- BIP-44 index m/44'/60'/0'/0/{index}
    created_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Every incoming on-chain deposit transaction
CREATE TABLE IF NOT EXISTS crypto_deposits (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    tx_hash         TEXT    NOT NULL UNIQUE,   -- 0x... transaction hash
    token           TEXT    NOT NULL DEFAULT 'USDT',  -- USDT | BNB
    amount_raw      TEXT    NOT NULL,          -- raw integer string (wei / 1e18)
    amount_usdt     REAL    NOT NULL,          -- converted USDT value credited
    confirmations   INTEGER NOT NULL DEFAULT 0,
    -- pending  → credited to wallet but withdrawal locked
    -- confirmed → >= DEPOSIT_FULL_CONFIRMATIONS
    -- failed   → reorg detected (rare, refund manually)
    status          TEXT    NOT NULL DEFAULT 'pending',
    block_number    INTEGER NOT NULL,
    credited_at     TEXT    DEFAULT NULL,      -- when balance was updated
    confirmed_at    TEXT    DEFAULT NULL,
    created_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_crypto_deposits_user   ON crypto_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_status ON crypto_deposits(status);
CREATE INDEX IF NOT EXISTS idx_crypto_addr_address    ON crypto_deposit_addresses(address);
