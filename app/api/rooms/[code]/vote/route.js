import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "../../../../../lib/store";
import { castVote, allVotesIn, tallyVotes, viewFor } from "../../../../../lib/game";

export async function POST(req, { params }) {
  const { code } = params;
  const { playerId, targetId } = await req.json();

  const room = await getRoom(code);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }
  if (room.phase !== "vote") {
    return NextResponse.json({ error: "Voting isn't open right now." }, { status: 400 });
  }
  if (!room.players.some((p) => p.id === playerId)) {
    return NextResponse.json({ error: "Not a player in this room." }, { status: 403 });
  }
  if (!room.players.some((p) => p.id === targetId)) {
    return NextResponse.json({ error: "Invalid vote target." }, { status: 400 });
  }

  castVote(room, playerId, targetId);
  if (allVotesIn(room)) {
    tallyVotes(room);
  }
  await saveRoom(room);

  return NextResponse.json(viewFor(room, playerId));
}
