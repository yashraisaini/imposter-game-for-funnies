import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "../../../lib/store";
import { newRoomCode, newPlayerId, newRoom } from "../../../lib/game";

export async function POST(req) {
  const { hostName, mode } = await req.json();
  const name = (hostName || "").trim().slice(0, 24);
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const roomMode = mode === "local" ? "local" : "remote";

  let code;
  for (let i = 0; i < 5; i++) {
    code = newRoomCode();
    if (!(await getRoom(code))) break;
  }

  const hostId = newPlayerId();
  const room = newRoom({ code, hostId, hostName: name, mode: roomMode });
  await saveRoom(room);

  return NextResponse.json({ code: room.code, playerId: hostId });
}
