"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { topicList } from "../../../lib/words";

const PRESET_TOPICS = topicList();
const NICHE_LEVELS = [
  { id: "broad", label: "Broad" },
  { id: "specific", label: "Specific" },
  { id: "niche", label: "Niche" },
];
const PRESET_TIERS = [
  { id: "lessNiche", label: "Less Niche" },
  { id: "niche", label: "Niche" },
];
const POLL_MS = 1500;

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

export default function RoomPage({ params }) {
  const { code } = params;
  const router = useRouter();
  const [playerId, setPlayerId] = useState(null);
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    const id = sessionStorage.getItem(`imposter:${code}`);
    if (!id) {
      router.replace("/");
      return;
    }
    setPlayerId(id);
  }, [code, router]);

  useEffect(() => {
    if (!playerId) return;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/rooms/${code}?playerId=${playerId}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Something went wrong.");
          return;
        }
        setState((prev) => {
          if (prev && prev.phase !== "reveal" && data.phase === "reveal") setRevealed(false);
          return data;
        });
        setError("");
      } catch (e) {
        if (!cancelled) setError("Connection hiccup — retrying...");
      }
    }

    poll();
    pollRef.current = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
    };
  }, [playerId, code]);

  if (!playerId || !state) {
    return (
      <div className="shell">
        <div className="masthead">
          <div className="stamp">// classified //</div>
          <h1>IMPOSTER</h1>
        </div>
        {error && <div className="error-banner">{error}</div>}
        <p className="muted">Pulling up the case file...</p>
      </div>
    );
  }

  const isHost = state.hostId === playerId;
  const isLocal = state.mode === "local";

  return (
    <div className="shell">
      <div className="masthead">
        <div className="stamp">// case file //</div>
        <div className="room-code-display">{code}</div>
        {error && <div className="error-banner">{error}</div>}
      </div>

      <div className="card">
        {state.phase === "lobby" && (
          <LobbyPhase state={state} isHost={isHost} isLocal={isLocal} playerId={playerId} code={code} setError={setError} />
        )}

        {state.phase === "reveal" && isLocal && (
          <LocalRevealSequencer state={state} playerId={playerId} code={code} setError={setError} />
        )}
        {state.phase === "reveal" && !isLocal && (
          <RevealPhase state={state} isHost={isHost} playerId={playerId} code={code} revealed={revealed} setRevealed={setRevealed} setError={setError} />
        )}

        {state.phase === "discuss" && isLocal && (
          <LocalDiscussPhase state={state} isHost={isHost} playerId={playerId} code={code} setError={setError} />
        )}
        {state.phase === "discuss" && !isLocal && (
          <DiscussPhase state={state} isHost={isHost} playerId={playerId} code={code} setError={setError} />
        )}

        {state.phase === "vote" && isLocal && (
          <LocalVotePhase state={state} playerId={playerId} code={code} setError={setError} />
        )}
        {state.phase === "vote" && !isLocal && (
          <VotePhase state={state} playerId={playerId} isHost={isHost} code={code} setError={setError} />
        )}

        {state.phase === "results" && (
          <ResultsPhase state={state} isHost={isHost} playerId={playerId} code={code} setError={setError} />
        )}
      </div>

      <p className="footer-note">
        {isLocal ? "Pass & play — one phone." : `Room code: ${code} · Share it with everyone playing.`}
      </p>
    </div>
  );
}

function TopicPicker({ topic, setTopic, customTopic, setCustomTopic, niche, setNiche, presetTier, setPresetTier }) {
  const [customTopics, setCustomTopics] = useState({});

  useEffect(() => {
    fetch("/api/topics")
      .then((r) => r.json())
      .then((d) => setCustomTopics(d.topics || {}))
      .catch(() => {});
  }, []);

  const customNames = Object.keys(customTopics);
  const isPresetSelected = topic && !customTopic && PRESET_TOPICS.includes(topic);

  return (
    <>
      <div className="divider">topic</div>
      <div className="topic-grid">
        {PRESET_TOPICS.map((t) => (
          <button
            key={t}
            className={`topic-btn ${topic === t && !customTopic ? "selected" : ""}`}
            onClick={() => {
              setTopic(t);
              setCustomTopic("");
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {isPresetSelected && (
        <div>
          <label className="field-label">How niche?</label>
          <div className="row">
            {PRESET_TIERS.map((t) => (
              <button
                key={t.id}
                className="btn"
                style={{
                  borderColor: presetTier === t.id ? "var(--kraft)" : "var(--line)",
                  color: presetTier === t.id ? "var(--kraft)" : "var(--paper-dim)",
                }}
                onClick={() => setPresetTier(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {customNames.length > 0 && (
        <>
          <div className="field-label" style={{ marginTop: 4 }}>Your Lists</div>
          <div className="topic-grid">
            {customNames.map((t) => (
              <button
                key={t}
                className={`topic-btn ${topic === t && !customTopic ? "selected" : ""}`}
                onClick={() => {
                  setTopic(t);
                  setCustomTopic("");
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </>
      )}

      <div>
        <label className="field-label">Or type any topic (AI-generated)</label>
        <input
          type="text"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          placeholder="e.g. 90s cartoons, kitchen tools, dinosaurs..."
        />
      </div>

      {customTopic.trim() && (
        <div>
          <label className="field-label">How niche?</label>
          <div className="row">
            {NICHE_LEVELS.map((n) => (
              <button
                key={n.id}
                className="btn"
                style={{
                  borderColor: niche === n.id ? "var(--kraft)" : "var(--line)",
                  color: niche === n.id ? "var(--kraft)" : "var(--paper-dim)",
                }}
                onClick={() => setNiche(n.id)}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function LobbyPhase({ state, isHost, isLocal, playerId, code, setError }) {
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [niche, setNiche] = useState("specific");
  const [presetTier, setPresetTier] = useState("lessNiche");
  const [noHints, setNoHints] = useState(false);
  const [imposterCount, setImposterCount] = useState(1);
  const [starting, setStarting] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [addingPlayer, setAddingPlayer] = useState(false);

  const chosenTopic = customTopic.trim() || topic;
  const maxImposters = Math.max(1, Math.min(4, state.players.length - 1));

  async function handleAddPlayer(e) {
    e.preventDefault();
    setError("");
    if (!newPlayerName.trim()) return;
    setAddingPlayer(true);
    try {
      await post(`/api/rooms/${code}/join`, { name: newPlayerName.trim() });
      setNewPlayerName("");
    } catch (e) {
      setError(e.message);
    } finally {
      setAddingPlayer(false);
    }
  }

  async function handleStart() {
    setError("");
    if (!chosenTopic) return setError("Pick a topic or type your own.");
    setStarting(true);
    try {
      await post(`/api/rooms/${code}/start`, {
        playerId,
        topic: chosenTopic,
        imposterCount,
        niche,
        presetTier,
        noHints,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="stack">
      <div>
        <div className="field-label">Players ({state.players.length})</div>
        <ul className="player-list">
          {state.players.map((p) => (
            <li key={p.id}>
              <span>{p.name}</span>
              {p.isHost && <span className="tag">host</span>}
            </li>
          ))}
        </ul>
      </div>

      {isLocal && (
        <form className="row" onSubmit={handleAddPlayer}>
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Add a player's name..."
            maxLength={24}
            style={{ flex: 1 }}
          />
          <button className="btn" style={{ width: "auto", padding: "0 16px" }} disabled={addingPlayer}>
            Add
          </button>
        </form>
      )}

      {isHost ? (
        <>
          <TopicPicker
            topic={topic}
            setTopic={setTopic}
            customTopic={customTopic}
            setCustomTopic={setCustomTopic}
            niche={niche}
            setNiche={setNiche}
            presetTier={presetTier}
            setPresetTier={setPresetTier}
          />

          <div>
            <label className="field-label">Imposter hint</label>
            <div className="row">
              <button
                className="btn"
                style={{
                  borderColor: !noHints ? "var(--kraft)" : "var(--line)",
                  color: !noHints ? "var(--kraft)" : "var(--paper-dim)",
                }}
                onClick={() => setNoHints(false)}
              >
                Give a Decoy Word
              </button>
              <button
                className="btn"
                style={{
                  borderColor: noHints ? "var(--kraft)" : "var(--line)",
                  color: noHints ? "var(--kraft)" : "var(--paper-dim)",
                }}
                onClick={() => setNoHints(true)}
              >
                No Hints
              </button>
            </div>
            {noHints && (
              <p className="muted" style={{ marginTop: 6 }}>
                The imposter gets nothing — they have to bluff purely by listening.
              </p>
            )}
          </div>

          <div>
            <label className="field-label">Number of imposters</label>
            <div className="row">
              {Array.from({ length: maxImposters }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className="btn"
                  style={{
                    borderColor: imposterCount === n ? "var(--kraft)" : "var(--line)",
                    color: imposterCount === n ? "var(--kraft)" : "var(--paper-dim)",
                  }}
                  onClick={() => setImposterCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleStart}
            disabled={starting || state.players.length < 3}
          >
            {starting
              ? "Briefing agents..."
              : state.players.length < 3
              ? isLocal
                ? "Add 3+ players"
                : "Need 3+ players"
              : "Start Round"}
          </button>
        </>
      ) : (
        <p className="muted center">Waiting for the host to start the round...</p>
      )}
    </div>
  );
}

function RevealPhase({ state, isHost, playerId, code, revealed, setRevealed, setError }) {
  const isImposter = state.you.isImposter;
  const noHint = isImposter && !state.yourWord;

  async function handleAdvance() {
    setError("");
    try {
      await post(`/api/rooms/${code}/advance`, { playerId });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="reveal-wrap">
      <div className="phase-banner">topic: {state.topic}</div>
      <div
        className={`redacted-box ${revealed ? "open" : ""}`}
        onClick={() => setRevealed(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setRevealed(true)}
      >
        <div className="redacted-bar">TAP TO DECLASSIFY</div>
        <div className="your-word">{noHint ? "NO HINT" : state.yourWord}</div>
        <div className={`role-tag ${isImposter ? "imposter" : ""}`}>
          {isImposter ? "you are the imposter" : "you are a civilian"}
        </div>
      </div>
      <p className="muted">
        {noHint
          ? "You get nothing to go on — listen closely and blend in by ear."
          : "Don't say it out loud — discuss around it. When everyone has seen their word, the host moves on."}
      </p>
      {isHost && (
        <button className="btn btn-primary" onClick={handleAdvance}>
          Everyone&apos;s Seen It — Begin Discussion
        </button>
      )}
    </div>
  );
}

// --- Local (pass & play) reveal: host hands the phone to each player in turn ---
function LocalRevealSequencer({ state, playerId, code, setError }) {
  const [index, setIndex] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [wordData, setWordData] = useState(null);
  const [seen, setSeen] = useState(false);

  const players = state.players;
  const current = players[index];

  useEffect(() => {
    setPressed(false);
    setSeen(false);
    setWordData(null);
    if (!current) return;
    fetch(`/api/rooms/${code}?playerId=${current.id}`)
      .then((r) => r.json())
      .then((d) => setWordData(d))
      .catch(() => setError("Couldn't load that player's word."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, current?.id]);

  async function handleNext() {
    if (index + 1 < players.length) {
      setIndex(index + 1);
    } else {
      setError("");
      try {
        await post(`/api/rooms/${code}/advance`, { playerId });
      } catch (e) {
        setError(e.message);
      }
    }
  }

  if (!current) return null;

  return (
    <div className="reveal-wrap">
      <div className="phase-banner">topic: {state.topic}</div>
      <p className="muted">Hand the phone to</p>
      <div className="your-word" style={{ margin: "6px 0 16px" }}>{current.name}</div>

      <div
        className={`redacted-box ${pressed ? "open" : ""}`}
        onPointerDown={() => {
          setPressed(true);
          setSeen(true);
        }}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        role="button"
        tabIndex={0}
      >
        <div className="redacted-bar">PRESS &amp; HOLD TO REVEAL</div>
        {wordData ? (
          <>
            <div className="your-word">
              {wordData.you.isImposter && !wordData.yourWord ? "NO HINT" : wordData.yourWord}
            </div>
            <div className={`role-tag ${wordData.you.isImposter ? "imposter" : ""}`}>
              {wordData.you.isImposter ? "you are the imposter" : "you are a civilian"}
            </div>
          </>
        ) : (
          <div className="muted">loading...</div>
        )}
      </div>

      <p className="muted">
        {current.name}, memorize it, let go, and hand the phone to the next player.
      </p>
      <button className="btn btn-primary" onClick={handleNext} disabled={!seen}>
        {index + 1 < players.length ? `Next: ${players[index + 1].name}` : "Everyone's Seen It — Discuss"}
      </button>
    </div>
  );
}

function DiscussPhase({ state, isHost, playerId, code, setError }) {
  const noHint = state.you.isImposter && !state.yourWord;

  async function handleAdvance() {
    setError("");
    try {
      await post(`/api/rooms/${code}/advance`, { playerId });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="stack center">
      <div className="phase-banner">topic: {state.topic}</div>
      <div className="your-word" style={{ margin: "20px 0" }}>
        {noHint ? "NO HINT" : state.yourWord}
      </div>
      <p className="muted">
        Talk it through out loud. Everyone describes their word one clue at a time —
        the imposter is bluffing.
      </p>
      {isHost && (
        <button className="btn btn-primary" onClick={handleAdvance}>
          Open Voting
        </button>
      )}
      {!isHost && <p className="muted">Waiting for the host to open voting...</p>}
    </div>
  );
}

function LocalDiscussPhase({ state, playerId, code, setError }) {
  async function handleAdvance() {
    setError("");
    try {
      await post(`/api/rooms/${code}/advance`, { playerId });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="stack center">
      <div className="phase-banner">topic: {state.topic}</div>
      <p className="muted" style={{ margin: "16px 0" }}>
        Everyone take turns describing your word out loud, one clue at a time.
        The imposter{state.imposterCount > 1 ? "s are" : " is"} bluffing along.
      </p>
      <button className="btn btn-primary" onClick={handleAdvance}>
        Ready to Vote
      </button>
    </div>
  );
}

function VotePhase({ state, playerId, isHost, code, setError }) {
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const alreadyVoted = !!state.votes[playerId];

  async function handleVote(targetId) {
    setSelected(targetId);
    setSubmitting(true);
    setError("");
    try {
      await post(`/api/rooms/${code}/vote`, { playerId, targetId });
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForceClose() {
    setError("");
    try {
      await post(`/api/rooms/${code}/advance`, { playerId });
    } catch (e) {
      setError(e.message);
    }
  }

  const votedCount = Object.keys(state.votes).length;

  return (
    <div className="stack">
      <div className="phase-banner">who&apos;s the imposter?</div>
      <div className="vote-grid">
        {state.players.map((p) => (
          <button
            key={p.id}
            className={`vote-btn ${selected === p.id ? "selected" : ""}`}
            onClick={() => handleVote(p.id)}
            disabled={submitting || (alreadyVoted && selected !== p.id)}
          >
            <span>{p.name}</span>
            {state.votes[p.id] !== undefined && <span className="tag">voted</span>}
          </button>
        ))}
      </div>
      <p className="muted center">
        {votedCount}/{state.players.length} votes in
      </p>
      {isHost && (
        <button className="btn" onClick={handleForceClose}>
          Close Voting Now
        </button>
      )}
    </div>
  );
}

// --- Local voting: host taps who the group called out, out loud ---
function LocalVotePhase({ state, playerId, code, setError }) {
  const [submitting, setSubmitting] = useState(false);

  async function handlePick(targetId) {
    setSubmitting(true);
    setError("");
    try {
      await post(`/api/rooms/${code}/local-result`, { playerId, ejectedId: targetId });
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack">
      <div className="phase-banner">who did the group vote out?</div>
      <p className="muted center">Talk it out loud, then tap the group's pick.</p>
      <div className="vote-grid">
        {state.players.map((p) => (
          <button
            key={p.id}
            className="vote-btn"
            onClick={() => handlePick(p.id)}
            disabled={submitting}
          >
            <span>{p.name}</span>
          </button>
        ))}
      </div>
      <button className="btn" onClick={() => handlePick(null)} disabled={submitting}>
        No Consensus / Skip
      </button>
    </div>
  );
}

function ResultsPhase({ state, isHost, playerId, code, setError }) {
  const { result } = state;
  const nameOf = (id) => state.players.find((p) => p.id === id)?.name || "Unknown";

  async function handleNext() {
    setError("");
    try {
      await post(`/api/rooms/${code}/next`, { playerId });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="stack center">
      <div className={`result-stamp ${result.wasImposter ? "caught" : ""}`}>
        {result.tie
          ? "NO CONSENSUS"
          : result.wasImposter
          ? "IMPOSTER CAUGHT"
          : "WRONG SUSPECT"}
      </div>

      {!result.tie && (
        <p>
          The room voted out <strong>{nameOf(result.ejectedId)}</strong>
          {result.wasImposter ? " — correct call." : ", who was innocent."}
        </p>
      )}

      <div className="divider">reveal</div>
      <p className="muted">
        Civilian word: <strong style={{ color: "var(--paper)" }}>{result.civilianWord}</strong>
        <br />
        Imposter word:{" "}
        <strong style={{ color: "var(--stamp-red)" }}>
          {result.imposterWord || "No hint given"}
        </strong>
      </p>
      <p className="muted">
        The imposter{result.imposterIds.length > 1 ? "s were" : " was"}{" "}
        {result.imposterIds.map(nameOf).join(", ")}.
      </p>

      {isHost ? (
        <button className="btn btn-primary" onClick={handleNext}>
          Start Next Round
        </button>
      ) : (
        <p className="muted">Waiting for the host to start the next round...</p>
      )}
    </div>
  );
}
