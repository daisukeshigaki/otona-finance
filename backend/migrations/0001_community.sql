CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  lesson_path TEXT NOT NULL,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  reply TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  published_at TEXT,
  notification_sent INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX comments_public_lesson ON comments(status, lesson_path, published_at DESC);
CREATE INDEX comments_public_recent ON comments(status, published_at DESC);
CREATE TABLE inquiries (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK(category IN ('question','general','training')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','done')),
  created_at TEXT NOT NULL,
  notification_sent INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX inquiries_status_date ON inquiries(status, created_at DESC);
CREATE TABLE limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE login_codes (id TEXT PRIMARY KEY, code_hash TEXT NOT NULL, expires INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0);
CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL);
