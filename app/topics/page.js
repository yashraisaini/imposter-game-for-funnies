"use client";

import { useEffect, useState } from "react";

export default function TopicsPage() {
  const [topics, setTopics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topicName, setTopicName] = useState("");
  const [civilian, setCivilian] = useState("");
  const [imposter, setImposter] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/topics");
      const data = await res.json();
      setTopics(data.topics || {});
    } catch (e) {
      setError("Couldn't load your topics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!topicName.trim() || !civilian.trim() || !imposter.trim()) {
      setError("Fill in the topic name and both words.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicName, civilian, imposter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save that.");
      setTopics(data.topics);
      setCivilian("");
      setImposter("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemovePair(name, pairId) {
    const res = await fetch("/api/topics/pair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicName: name, pairId }),
    });
    const data = await res.json();
    if (res.ok) setTopics(data.topics);
  }

  async function handleRemoveTopic(name) {
    const res = await fetch("/api/topics/pair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicName: name, deleteWholeTopic: true }),
    });
    const data = await res.json();
    if (res.ok) setTopics(data.topics);
  }

  return (
    <div className="shell">
      <div className="masthead">
        <div className="stamp">// evidence locker //</div>
        <h1 style={{ fontSize: 28 }}>YOUR TOPICS</h1>
        <div className="sub">custom word lists you curate — always available at game time</div>
      </div>

      <div className="card">
        {error && <div className="error-banner">{error}</div>}
        <form className="stack" onSubmit={handleAdd}>
          <div>
            <label className="field-label">Topic name</label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g. Waterloo Inside Jokes"
              maxLength={40}
            />
          </div>
          <div className="row">
            <div style={{ flex: 1 }}>
              <label className="field-label">Civilian word</label>
              <input
                type="text"
                value={civilian}
                onChange={(e) => setCivilian(e.target.value)}
                placeholder="everyone but imposter sees this"
                maxLength={40}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">Imposter word</label>
              <input
                type="text"
                value={imposter}
                onChange={(e) => setImposter(e.target.value)}
                placeholder="the decoy"
                maxLength={40}
              />
            </div>
          </div>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Filing..." : "Add Pair"}
          </button>
        </form>
      </div>

      <div style={{ height: 20 }} />

      <div className="card">
        <div className="field-label">Saved lists</div>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : Object.keys(topics).length === 0 ? (
          <p className="muted">No custom topics yet — add your first pair above.</p>
        ) : (
          <div className="stack">
            {Object.entries(topics).map(([name, pairs]) => (
              <div key={name}>
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <strong style={{ color: "var(--kraft)" }}>{name}</strong>
                  <button className="btn btn-danger" style={{ width: "auto", padding: "6px 10px", fontSize: 11 }} onClick={() => handleRemoveTopic(name)}>
                    Delete List
                  </button>
                </div>
                <ul className="player-list">
                  {pairs.map((p) => (
                    <li key={p.id}>
                      <span>
                        {p.civilian} <span className="muted">/</span> {p.imposter}
                      </span>
                      <button
                        className="btn"
                        style={{ width: "auto", padding: "4px 10px", fontSize: 11 }}
                        onClick={() => handleRemovePair(name, p.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="footer-note">
        <a href="/" style={{ color: "var(--kraft-dim)" }}>← Back to game</a>
      </p>
    </div>
  );
}
