import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "../../../../../lib/store";
import { viewFor, tallyVotes } from "../../../../../lib/game";

const NEXT_PHASE = {
  reveal: "discuss",
  discuss: "vote",
};

export async function POST(req, { params }) {
  const { code } = params;
  const { playerId } = await req.json();

  const room = await getRoom(code);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }
  if (room.hostId !== playerId) {
    return NextResponse.json({ error: "Only the host can advance the round." }, { status: 403 });
  }

  if (room.phase === "vote") {
    // Host force-closes voting even if stragglers haven't voted yet.
    tallyVotes(room);
    await saveRoom(room);
    return NextResponse.json(viewFor(room, playerId));
  }

  const next = NEXT_PHASE[room.phase];
  if (!next) {
    return NextResponse.json({ error: `Can't advance from ${room.phase}.` }, { status: 400 });
  }
  room.phase = next;
  await saveRoom(room);

  return NextResponse.json(viewFor(room, playerId));
}
