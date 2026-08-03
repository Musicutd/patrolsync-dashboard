import React, { useEffect, useState } from "react";
import "./style.css";

const API_URL = "https://patrolsync-backend.onrender.com";
const TENANT_ID = 1;

export default function App() {
  const [sites, setSites] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [guards, setGuards] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
  const [selectedGuard, setSelectedGuard] = useState("");
  const [logging, setLogging] = useState(false);
  const [message, setMessage] = useState("");

  const loadAll = () => {
    fetch(`${API_URL}/api/sites?tenant_id=${TENANT_ID}`)
      .then(r => r.json())
      .then(setSites);

    fetch(`${API_URL}/api/checkpoints?tenant_id=${TENANT_ID}`)
      .then(r => r.json())
      .then(data => {
        setCheckpoints(data);
        if (data.length > 0 && !selectedCheckpoint) {
          setSelectedCheckpoint(data[0].id);
        }
      });

    fetch(`${API_URL}/api/users?tenant_id=${TENANT_ID}&role=guard`)
      .then(r => r.json())
      .then(data => {
        setGuards(data);
        if (data.length > 0 && !selectedGuard) {
          setSelectedGuard(data[0].id);
        }
      });

    fetch(`${API_URL}/api/patrol-logs?tenant_id=${TENANT_ID}`)
      .then(r => r.json())
      .then(setLogs);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleLogPatrol = async () => {
    if (!selectedCheckpoint || !selectedGuard) return;
    setLogging(true);
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/patrol-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: TENANT_ID,
          checkpoint_id: Number(selectedCheckpoint),
          user_id: Number(selectedGuard)
        })
      });
      if (!res.ok) throw new Error("Failed to log patrol");
      setMessage("Patrol logged successfully!");
      fetch(`${API_URL}/api/patrol-logs?tenant_id=${TENANT_ID}`)
        .then(r => r.json())
        .then(setLogs);
    } catch (err) {
      setMessage("Error logging patrol: " + err.message);
    } finally {
      setLogging(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const guardLabel = (userId) => {
    const guard = guards.find(g => g.id === userId);
    return guard ? guard.email : `User ${userId}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>PatrolSync Dashboard</h1>
        <span className="badge">Tenant #1</span>
      </div>

      <div className="card log-patrol-card">
        <h2>Log a Patrol</h2>
        <div className="log-form">
          <select
            value={selectedCheckpoint}
            onChange={e => setSelectedCheckpoint(e.target.value)}
          >
            {checkpoints.map(cp => (
              <option key={cp.id} value={cp.id}>
                {cp.name} ({cp.qr_code})
              </option>
            ))}
          </select>
          <select
            value={selectedGuard}
            onChange={e => setSelectedGuard(e.target.value)}
          >
            {guards.length === 0 ? (
              <option value="">No guards available</option>
            ) : (
              guards.map(g => (
                <option key={g.id} value={g.id}>
                  {g.email}
                </option>
              ))
            )}
          </select>
          <button
            onClick={handleLogPatrol}
            disabled={logging || !selectedCheckpoint || !selectedGuard}
          >
            {logging ? "Logging..." : "Log Patrol"}
          </button>
        </div>
        {message && <p className="log-message">{message}</p>}
      </div>

      <div className="grid">
        <div className="card">
          <h2>Sites</h2>
          {sites.length === 0 ? (
            <p className="empty">No sites yet</p>
          ) : (
            <ul>
              {sites.map(site => (
                <li key={site.id}>
                  <span className="item-title">{site.name}</span>
                  <span className="item-sub">{site.address}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Checkpoints</h2>
          {checkpoints.length === 0 ? (
            <p className="empty">No checkpoints yet</p>
          ) : (
            <ul>
              {checkpoints.map(cp => (
                <li key={cp.id}>
                  <span className="item-title">{cp.name}</span>
                  <span className="item-sub">QR: {cp.qr_code}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Patrol Logs</h2>
          {logs.length === 0 ? (
            <p className="empty">No patrol logs yet</p>
          ) : (
            <ul>
              {logs.map(log => (
                <li key={log.id}>
                  <span className="item-title">Checkpoint {log.checkpoint_id}</span>
                  <span className="item-sub">
                    {guardLabel(log.user_id)} · {new Date(log.scanned_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}