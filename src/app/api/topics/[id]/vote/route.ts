import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { MAX_VOTES } from "@/lib/constants";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No estás autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const sql = getDb();

  const body = await req.json().catch(() => ({}));
  const delta = body?.delta === -1 ? -1 : 1;

  // Check we're in voting phase
  const phase = await sql`SELECT current_phase FROM app_state WHERE id = 1`;
  if (phase[0]?.current_phase !== "voting") {
    return NextResponse.json({ error: "La votación no está abierta" }, { status: 403 });
  }

  // Only allow voting on topics that have a speaker
  const topic = await sql`SELECT id, speaker_id FROM topics WHERE id = ${id}`;
  if (topic.length === 0) {
    return NextResponse.json({ error: "Tema no encontrado" }, { status: 404 });
  }
  if (!topic[0].speaker_id) {
    return NextResponse.json({ error: "No se puede votar por temas sin speaker" }, { status: 400 });
  }

  const usedRows = await sql`
    SELECT COALESCE(SUM(weight), 0)::int as used FROM votes WHERE user_id = ${user.id}
  `;
  const used: number = usedRows[0].used;

  if (delta === 1) {
    if (used >= MAX_VOTES) {
      return NextResponse.json(
        { error: `Ya usaste tus ${MAX_VOTES} votos` },
        { status: 400 }
      );
    }
    await sql`
      INSERT INTO votes (user_id, topic_id, weight) VALUES (${user.id}, ${id}, 1)
      ON CONFLICT (user_id, topic_id) DO UPDATE SET weight = votes.weight + 1
    `;
  } else {
    await sql`
      UPDATE votes SET weight = weight - 1
      WHERE user_id = ${user.id} AND topic_id = ${id} AND weight > 0
    `;
    await sql`DELETE FROM votes WHERE user_id = ${user.id} AND topic_id = ${id} AND weight <= 0`;
  }

  const after = await sql`
    SELECT
      COALESCE((SELECT weight FROM votes WHERE user_id = ${user.id} AND topic_id = ${id}), 0)::int as weight,
      COALESCE((SELECT SUM(weight) FROM votes WHERE user_id = ${user.id}), 0)::int as used
  `;

  return NextResponse.json({ weight: after[0].weight, used: after[0].used });
}
