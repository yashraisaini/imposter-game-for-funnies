import { kvGet, kvSet } from "./kv";

const KEY = "custom-topics"; // single global dataset — no multi-user separation needed

// Shape: { [topicName]: [{ id, civilian, imposter }, ...] }
export async function getCustomTopics() {
  return (await kvGet(KEY)) || {};
}

export async function saveCustomTopics(data) {
  await kvSet(KEY, data);
  return data;
}

export async function addPair(topicName, civilian, imposter) {
  const data = await getCustomTopics();
  const name = topicName.trim();
  if (!data[name]) data[name] = [];
  data[name].push({
    id: Math.random().toString(36).slice(2, 10),
    civilian: civilian.trim(),
    imposter: imposter.trim(),
  });
  await saveCustomTopics(data);
  return data;
}

export async function removePair(topicName, pairId) {
  const data = await getCustomTopics();
  if (!data[topicName]) return data;
  data[topicName] = data[topicName].filter((p) => p.id !== pairId);
  if (data[topicName].length === 0) delete data[topicName];
  await saveCustomTopics(data);
  return data;
}

export async function removeTopic(topicName) {
  const data = await getCustomTopics();
  delete data[topicName];
  await saveCustomTopics(data);
  return data;
}

export async function randomPairFromCustomTopic(topicName) {
  const data = await getCustomTopics();
  const list = data[topicName];
  if (!list || list.length === 0) return null;
  const pick = list[Math.floor(Math.random() * list.length)];
  return { civilian: pick.civilian, imposter: pick.imposter };
}
