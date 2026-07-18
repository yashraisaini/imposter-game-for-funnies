import { NextResponse } from "next/server";
import { getRoom, saveRoom } from "../../../../../lib/store";
import { startRound, viewFor } from "../../../../../lib/game";
import { generateWordPair } from "../../../../../lib/ai";
import { getCustomTopics } from "../../../../../lib/customTopics";
import { TOPICS, randomPairForTopic } from "../../../../../lib/words";

export async function POST(req, { params }) {
  const { code } = params;
  const { playerId, topic, imposterCount, niche, presetTier, noHints } = await req.json();

  const room = await getRoom(code);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }
  if (room.hostId !== playerId) {
    return NextResponse.json({ error: "Only the host can start a round." }, { status: 403 });
  }
  if (room.players.length < 3) {
    return NextResponse.json(
      { error: "Need at least 3 players to start." },
      { status: 400 }
    );
  }
  const cleanTopic = (topic || "").trim().slice(0, 60);
  if (!cleanTopic) {
    return NextResponse.json({ error: "Topic is required." }, { status: 400 });
  }

  let civilian, imposter;

  const customTopics = await getCustomTopics();
  if (customTopics[cleanTopic] && customTopics[cleanTopic].length > 0) {
    // Yash's own curated list wins if the topic name matches exactly.
    const list = customTopics[cleanTopic];
    const pick = list[Math.floor(Math.random() * list.length)];
    civilian = pick.civilian;
    imposter = pick.imposter;
  } else if (TOPICS[cleanTopic]) {
    // Built-in preset — deterministic curated bank, no AI call needed.
    const tier = presetTier === "niche" ? "niche" : "lessNiche";
    const pair = randomPairForTopic(cleanTopic, tier);
    civilian = pair[0];
    imposter = pair[1];
  } else {
    // Free-text topic — ask the AI, with a niche/specificity level.
    const result = await generateWordPair(cleanTopic, niche);
    civilian = result.civilian;
    imposter = result.imposter;
  }

  // No-hints mode: the imposter gets nothing to bluff with, not even a decoy word.
  if (noHints) imposter = null;

  startRound(room, {
    topic: cleanTopic,
    civilianWord: civilian,
    imposterWord: imposter,
    imposterCount,
  });
  await saveRoom(room);

  return NextResponse.json(viewFor(room, playerId));
}
