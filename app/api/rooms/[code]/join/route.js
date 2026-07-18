import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "../../../../../lib/store";
import { addPlayer, newPlayerId, viewFor } from "../../../../../lib/game";

export async function POST(req, { params }) {
  const { code } = params;
  const { name } = await req.json();
  const trimmed = (name || "").trim().slice(0, 24);
  if (!trimmed) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const room = await getRoom(code);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }
  if (room.phase !== "lobby") {
    return NextResponse.json(
      { error: "This round has already started. Wait for the next round." },
      { status: 409 }
    );
  }
  if (room.players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
    return NextResponse.json(
      { error: "That name is already taken in this room." },
      { status: 409 }
    );
  }

  const playerId = newPlayerId();
  addPlayer(room, { id: playerId, name: trimmed });
  await saveRoom(room);

  return NextResponse.json({ playerId, ...viewFor(room, playerId) });
}
