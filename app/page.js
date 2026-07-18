"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [deviceMode, setDeviceMode] = useState("remote"); // "remote" | "local"
  const [mode, setMode] = useState("create"); // "create" | "join" (remote only)
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e, roomMode) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Enter your name first.");
    setLoading(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: name.trim(), mode: roomMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't create room.");
      sessionStorage.setItem(`imposter:${data.code}`, data.playerId);
      router.push(`/room/${data.code}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Enter your name first.");
    if (!code.trim()) return setError("Enter a case file number.");
    setLoading(true);
    try {
      const upperCode = code.trim().toUpperCase();
      const res = await fetch(`/api/rooms/${upperCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't join room.");
      sessionStorage.setItem(`imposter:${upperCode}`, data.playerId);
      router.push(`/room/${upperCode}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <div className="masthead">
        <div className="stamp">// classified · party protocol //</div>
        <h1>IMPOSTER</h1>
        <div className="sub">one of you isn&apos;t who they say they are</div>
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 20 }}>
          <button
            className="btn"
            style={{
              borderColor: deviceMode === "remote" ? "var(--kraft)" : "var(--line)",
              color: deviceMode === "remote" ? "var(--kraft)" : "var(--paper-dim)",
            }}
            onClick={() => {
              setDeviceMode("remote");
              setError("");
            }}
          >
            Everyone&apos;s Phone
          </button>
          <button
            className="btn"
            style={{
              borderColor: deviceMode === "local" ? "var(--kraft)" : "var(--line)",
              color: deviceMode === "local" ? "var(--kraft)" : "var(--paper-dim)",
            }}
            onClick={() => {
              setDeviceMode("local");
              setError("");
            }}
          >
            Pass &amp; Play
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {deviceMode === "remote" ? (
          <>
            <div className="row" style={{ marginBottom: 20 }}>
              <button
                className="btn"
                style={{
                  borderColor: mode === "create" ? "var(--kraft)" : "var(--line)",
                  color: mode === "create" ? "var(--kraft)" : "var(--paper-dim)",
                }}
                onClick={() => setMode("create")}
              >
                New Case
              </button>
              <button
                className="btn"
                style={{
                  borderColor: mode === "join" ? "var(--kraft)" : "var(--line)",
                  color: mode === "join" ? "var(--kraft)" : "var(--paper-dim)",
                }}
                onClick={() => setMode("join")}
              >
                Join Case
              </button>
            </div>

            {mode === "create" ? (
              <form className="stack" onSubmit={(e) => handleCreate(e, "remote")}>
                <div>
                  <label className="field-label">Your name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Detective..."
                    maxLength={24}
                    autoFocus
                  />
                </div>
                <button className="btn btn-primary" disabled={loading}>
                  {loading ? "Opening file..." : "Open Case File"}
                </button>
                <p className="muted center">
                  Everyone joins on their own phone with the room code.
                </p>
              </form>
            ) : (
              <form className="stack" onSubmit={handleJoin}>
                <div>
                  <label className="field-label">Your name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Detective..."
                    maxLength={24}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="field-label">Case file number</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ABCDE"
                    maxLength={5}
                    style={{ letterSpacing: "0.2em" }}
                  />
                </div>
                <button className="btn btn-primary" disabled={loading}>
                  {loading ? "Joining..." : "Join Case"}
                </button>
              </form>
            )}
          </>
        ) : (
          <form className="stack" onSubmit={(e) => handleCreate(e, "local")}>
            <div>
              <label className="field-label">Your name (you&apos;ll run the game)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Detective..."
                maxLength={24}
                autoFocus
              />
            </div>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Setting up..." : "Start Pass & Play"}
            </button>
            <p className="muted center">
              One phone. You&apos;ll add everyone&apos;s name, then hand the phone
              around to reveal words.
            </p>
          </form>
        )}
      </div>

      <p className="footer-note">
        Everyone gets the same secret word — except the imposter, who gets a decoy.
        Talk it out, then vote out who you think is faking it.
        <br />
        <a href="/topics" style={{ color: "var(--kraft-dim)" }}>
          Manage your custom topic lists →
        </a>
      </p>
    </div>
  );
}
