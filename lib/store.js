import { kvGet, kvSet, kvDelete, usingPersistentStore } from "./kv";

const ROOM_TTL_SECONDS = 60 * 60 * 6; // 6 hours — rooms auto-expire, no cleanup job needed

const key = (code) => `room:${code.toUpperCase()}`;

export async function getRoom(code) {
  return await kvGet(key(code));
}

export async function saveRoom(room) {
  await kvSet(key(room.code), room, ROOM_TTL_SECONDS);
  return room;
}

export async function deleteRoom(code) {
  await kvDelete(key(code));
}

export { usingPersistentStore };
