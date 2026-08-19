import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const sql = getDb();
  const topics = await sql`
    SELECT
      t.id, t.title, t.description, t.type, t.created_at,
      t.proposed_by, t.speaker_id,
      p.name as proposed_by_name,
      s.name as speaker_name,
      COALESCE(v.vote_count, 0)::int as vote_count
    FROM topics t
    LEFT JOIN users p ON t.proposed_by = p.id
    LEFT JOIN users s ON t.speaker_id = s.id
    LEFT JOIN (
      SELECT topic_id, SUM(weight)::int as vote_count FROM votes GROUP BY topic_id
    ) v ON t.id = v.topic_id
    ORDER BY t.created_at DESC
  `;

  return NextResponse.json({ topics });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No estás autenticado" }, { status: 401 });
  }

  const sql = getDb();

  // Check we're in submission phase
  const phase = await sql`SELECT current_phase FROM app_state WHERE id = 1`;
  if (phase[0]?.current_phase !== "submission") {
    return NextResponse.json({ error: "Las propuestas están cerradas" }, { status: 403 });
  }

  const { title, description, type } = await req.json();

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }

  if (type !== "speaker_led" && type !== "orphan") {
    return NextResponse.json({ error: "Tipo de tema inválido" }, { status: 400 });
  }

  const speakerId = type === "speaker_led" ? user.id : null;

  const rows = await sql`
    INSERT INTO topics (title, description, proposed_by, speaker_id, type)
    VALUES (${title.trim()}, ${(description || "").trim()}, ${user.id}, ${speakerId}, ${type})
    RETURNING id
  `;

  return NextResponse.json({ id: rows[0].id }, { status: 201 });
}
