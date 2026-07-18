import { customAlphabet } from "nanoid";

const genCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 5); // no ambiguous chars
const genId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12);

export function newRoomCode() {
  return genCode();
}

export function newPlayerId() {
  return genId();
}

export function newRoom({ code, hostId, hostName, mode = "remote" }) {
  return {
    code,
    createdAt: Date.now(),
    mode, // "remote" (own phones) | "local" (pass & play, one phone)
    phase: "lobby", // lobby -> reveal -> discuss -> vote -> results
    hostId,
    topic: null,
    civilianWord: null,
    imposterWord: null,
    imposterCount: 1,
    round: 0,
    players: [
      { id: hostId, name: hostName, isHost: true, connectedAt: Date.now() },
    ],
    imposterIds: [],
    votes: {}, // voterId -> targetId
    lastResult: null,
  };
}

export function addPlayer(room, { id, name }) {
  if (room.players.some((p) => p.id === id)) return room;
  room.players.push({ id, name, isHost: false, connectedAt: Date.now() });
  return room;
}

export function startRound(room, { topic, civilianWord, imposterWord, imposterCount }) {
  const count = Math.max(1, Math.min(imposterCount || 1, room.players.length - 1));
  const shuffled = [...room.players].sort(() => Math.random() - 0.5);
  const imposterIds = shuffled.slice(0, count).map((p) => p.id);

  room.phase = "reveal";
  room.topic = topic;
  room.civilianWord = civilianWord;
  room.imposterWord = imposterWord;
  room.imposterCount = count;
  room.round += 1;
  room.imposterIds = imposterIds;
  room.votes = {};
  room.lastResult = null;
  return room;
}

export function castVote(room, voterId, targetId) {
  room.votes[voterId] = targetId;
  return room;
}

export function allVotesIn(room) {
  return Object.keys(room.votes).length >= room.players.length;
}

export function tallyVotes(room) {
  const counts = {};
  for (const targetId of Object.values(room.votes)) {
    counts[targetId] = (counts[targetId] || 0) + 1;
  }
  let topId = null;
  let topCount = -1;
  let tie = false;
  for (const [id, count] of Object.entries(counts)) {
    if (count > topCount) {
      topCount = count;
      topId = id;
      tie = false;
    } else if (count === topCount) {
      tie = true;
    }
  }
  const ejectedId = tie ? null : topId;
  const wasImposter = ejectedId ? room.imposterIds.includes(ejectedId) : false;

  room.phase = "results";
  room.lastResult = {
    counts,
    ejectedId,
    tie,
    wasImposter,
    imposterIds: room.imposterIds,
    civilianWord: room.civilianWord,
    imposterWord: room.imposterWord,
  };
  return room;
}

// Local (pass & play) mode: the host speaks for the group and taps who the
// group voted out, instead of collecting individual votes over the network.
export function manualEject(room, ejectedId) {
  const tie = !ejectedId;
  const wasImposter = ejectedId ? room.imposterIds.includes(ejectedId) : false;

  room.phase = "results";
  room.lastResult = {
    counts: {},
    ejectedId: ejectedId || null,
    tie,
    wasImposter,
    imposterIds: room.imposterIds,
    civilianWord: room.civilianWord,
    imposterWord: room.imposterWord,
  };
  return room;
}

// What a specific player is allowed to see — never leak other players' roles
// or the imposter word to civilians before results.
export function viewFor(room, playerId) {
  const isImposter = room.imposterIds.includes(playerId);
  const base = {
    code: room.code,
    mode: room.mode || "remote",
    phase: room.phase,
    round: room.round,
    topic: room.topic,
    hostId: room.hostId,
    players: room.players.map((p) => ({ id: p.id, name: p.name, isHost: p.isHost })),
    imposterCount: room.imposterCount,
    you: { id: playerId, isImposter: room.phase === "lobby" ? undefined : isImposter },
    votes:
      room.phase === "vote" || room.phase === "results"
        ? Object.fromEntries(
            Object.entries(room.votes).map(([voterId]) => [voterId, true])
          ) // just who HAS voted, not who they voted for, until results
        : {},
  };

  if (room.phase === "reveal" || room.phase === "discuss" || room.phase === "vote") {
    base.yourWord = isImposter ? room.imposterWord : room.civilianWord;
  }

  if (room.phase === "results") {
    base.result = room.lastResult;
    base.votes = room.votes;
  }

  return base;
}
