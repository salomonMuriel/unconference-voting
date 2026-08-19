import { neon } from "@neondatabase/serverless";

export function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function initDb() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      session_token TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS topics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      proposed_by UUID REFERENCES users(id) ON DELETE CASCADE,
      speaker_id UUID REFERENCES users(id) ON DELETE SET NULL,
      type TEXT NOT NULL CHECK (type IN ('speaker_led', 'orphan')),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS votes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
      weight INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, topic_id)
    )
  `;

  // Existing databases predate weighted votes (several votes on one topic).
  await sql`ALTER TABLE votes ADD COLUMN IF NOT EXISTS weight INTEGER NOT NULL DEFAULT 1`;

  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      current_phase TEXT NOT NULL DEFAULT 'submission' CHECK (current_phase IN ('submission', 'voting')),
      CHECK (id = 1)
    )
  `;

  await sql`
    INSERT INTO app_state (id, current_phase) VALUES (1, 'submission')
    ON CONFLICT (id) DO NOTHING
  `;
}
