import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ votes: {}, used: 0 });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT topic_id, weight FROM votes WHERE user_id = ${user.id} AND weight > 0
  `;

  const votes: Record<string, number> = {};
  let used = 0;
  for (const r of rows) {
    votes[r.topic_id] = r.weight;
    used += r.weight;
  }

  return NextResponse.json({ votes, used });
}
