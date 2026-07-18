import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "../../../../../lib/store";
import { viewFor } from "../../../../../lib/game";

export async function POST(req, { params }) {
  const { code } = params;
  const { playerId } = await req.json();

  const room = await getRoom(code);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }
  if (room.hostId !== playerId) {
    return NextResponse.json({ error: "Only the host can start another round." }, { status: 403 });
  }

  room.phase = "lobby";
  room.topic = null;
  room.civilianWord = null;
  room.imposterWord = null;
  room.imposterIds = [];
  room.votes = {};
  room.lastResult = null;
  await saveRoom(room);

  return NextResponse.json(viewFor(room, playerId));
}
