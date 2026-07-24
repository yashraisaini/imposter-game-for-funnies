# Imposter — Case File Game

A real multiplayer Imposter/Undercover word game. Next.js frontend + API-route
backend, room codes, AI-generated word pairs for any topic, deployable free
on Vercel.

## How it plays hi

Two device modes, picked on the home screen:

**Everyone's Phone (remote)** — host opens a case file, gets a 5-letter code.
Everyone else joins with just their name + the code on their own phone. Each
person's reveal/vote happens on their own device.

**Pass & Play (local)** — one phone. The host adds every player's name right
in the lobby (no code, no joining). At reveal time the app walks through
each player one at a time — "Hand the phone to Sam" — and that player
press-and-holds a redacted box to see their word, then hands it to the next
person. Voting is out loud; the host just taps whoever the group calls out.

Either way:

1. Host picks a topic — a preset, one of your own custom lists, or types
   literally anything for AI generation (with a Broad/Specific/Niche dial) —
   and how many imposters (host picks 1 up to a few, scaled to group size).
2. Everyone gets the same secret word — except the imposter(s), who get a
   related-but-different decoy word.
3. Group discusses out loud describing their word without saying it.
4. Vote out who's faking it. Results reveal who was caught, plus both words.
5. Host starts another round.

## Your own custom topic lists

At `/topics` you can build your own curated word-pair datasets (e.g. inside
jokes, a specific fandom, whatever) — civilian word + imposter decoy word,
saved permanently. If you name a round's topic exactly the same as one of
your saved lists, the game pulls from it directly instead of calling the AI
or the built-in presets.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Works immediately — no environment variables
required. Without them:
- Rooms are stored in memory (fine for local dev, single process)
- Word pairs come from the built-in curated bank instead of AI generation

## Deploy free on Vercel

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com → New Project → import the repo. No config
   needed, it auto-detects Next.js.
3. **Strongly recommended** — add these two Environment Variables in the
   Vercel project settings before your first real game with friends:
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — free at
     https://upstash.com (create a Redis database → REST API tab). Without
     this, room state is only stored in memory per serverless function
     instance, so requests can randomly land on a "cold" instance that
     doesn't know about your room. It'll work sometimes and glitch other
     times — get the Redis creds, it's a 2-minute signup and free tier is
     generous.
   - `GEMINI_API_KEY` — optional, free, from
     https://aistudio.google.com/apikey (Google account, no credit card).
     Enables AI-generated word pairs for ANY topic the host types (not just
     the presets). Without it, free-text topics fall back to a generic
     unrelated pair (e.g. Coffee/Tea) instead.
4. Redeploy after adding env vars (Vercel → Deployments → ⋮ → Redeploy).

## Project structure

```
app/
  page.js              — home screen (create/join)
  room/[code]/page.js  — the whole game UI, polls server every 1.5s
  api/rooms/           — the backend: create, join, start, advance, vote, next
lib/
  store.js             — Redis-or-memory persistence layer
  game.js              — round/vote/reveal logic, keeps secrets server-side
  words.js             — curated fallback topic/word bank
  ai.js                — Gemini-powered word pair generation for any topic
```

## Ideas for what to add next

- Timer per discussion round
- Spectator mode / rejoin after disconnect
- Custom room settings (round time limit, no-imposter-word "blank" variant)
- Sound effects on reveal/results
- Persistent player stats across rounds in the same room
