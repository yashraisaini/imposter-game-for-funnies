import { NextResponse } from "next/server";
import { getRoom } from "../../../../lib/store";
import { viewFor } from "../../../../lib/game";

export async function GET(req, { params }) {
  const { code } = params;
  const { searchParams } = new URL(req.url);
  const playerId = searchParams.get("playerId");

  const room = await getRoom(code);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }
  if (!playerId || !room.players.some((p) => p.id === playerId)) {
    return NextResponse.json({ error: "Not a player in this room." }, { status: 403 });
  }

  return NextResponse.json(viewFor(room, playerId));
}
