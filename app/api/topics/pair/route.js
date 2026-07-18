import { NextResponse } from "next/server";
import { removePair, removeTopic } from "../../../../lib/customTopics";

export async function POST(req) {
  // POST instead of DELETE for simplicity with fetch + JSON body across environments
  const { topicName, pairId, deleteWholeTopic } = await req.json();
  if (!topicName) {
    return NextResponse.json({ error: "topicName is required." }, { status: 400 });
  }

  const data = deleteWholeTopic
    ? await removeTopic(topicName)
    : await removePair(topicName, pairId);

  return NextResponse.json({ topics: data });
}
