import { NextResponse } from "next/server";
import { getCustomTopics, addPair } from "../../../lib/customTopics";

export async function GET() {
  const data = await getCustomTopics();
  return NextResponse.json({ topics: data });
}

export async function POST(req) {
  const { topicName, civilian, imposter } = await req.json();
  const name = (topicName || "").trim().slice(0, 40);
  const c = (civilian || "").trim().slice(0, 40);
  const i = (imposter || "").trim().slice(0, 40);

  if (!name || !c || !i) {
    return NextResponse.json(
      { error: "Topic name, civilian word, and imposter word are all required." },
      { status: 400 }
    );
  }

  const data = await addPair(name, c, i);
  return NextResponse.json({ topics: data });
}
