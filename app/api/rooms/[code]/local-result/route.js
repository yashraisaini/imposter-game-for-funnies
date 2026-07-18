import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "../../../../../lib/store";
import { manualEject, viewFor } from "../../../../../lib/game";

export async function POST(req, { params }) {
  const { code } = params;
  const { playerId, ejectedId } = await req.json();

  const room = await getRoom(code);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }
  if (room.hostId !== playerId) {
    return NextResponse.json({ error: "Only the host can record the result." }, { status: 403 });
  }
  if (ejectedId && !room.players.some((p) => p.id === ejectedId)) {
    return NextResponse.json({ error: "Invalid player." }, { status: 400 });
  }

  manualEject(room, ejectedId || null);
  await saveRoom(room);

  return NextResponse.json(viewFor(room, playerId));
}
