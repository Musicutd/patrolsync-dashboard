import React, { useEffect, useState } from "react";
import "./style.css";

const API_URL = "https://patrolsync-backend.onrender.com";
const TENANT_ID = 1;
const USER_ID = 1;

export default function App() {
  const [sites, setSites] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
  const [logging, setLogging] = useState(false);
  const [message, setMessage] = useState("");

  const loadLogs = () => {
    fetch(`${API_URL}/api/patrol-logs?tenant_id=${TENANT_ID}`)
      .then(r => r.json())
      .then(setLogs);
  };

  useEffect(() => {
    fetch(`${API_URL}/api/sites?tenant_id=${TENANT_ID}`)
      .then(r => r.json())
      .then(setSites);

    fetch(`${API_URL}/api/checkpoints?tenant_id=${TENANT_ID}`)
      .then(r => r.json())
      .then(setCheckpoints);

    loadLogs();
  }, []);

  const handleLogPatrol = async () => {
    if (!selectedCheckpoint) {
      setMessage("Please select a checkpoint first.");
      return;
    }
    setLogging(true);
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/patrol-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: TENANT_ID,
          checkpoint_id: parseInt(selectedCheckpoint),
          user_id: USER_ID
        })
      });
      if (!res.ok) throw new Error("Failed to log patrol");
      setMessage("Patrol logged successfully!");
      loadLogs();
    } catch (err) {
      setMessage("Error logging patrol: " + err.message);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>PatrolSync Dashboard</h1>
        <span className="badge">Tenant #1</span>
      </div>

      <div className="card log-patrol-card">
        <h2>Log a Patrol</h2>
        <div className="log-patrol-form">
          <select
            value={selectedCheckpoint}
            onChange={e => setSelectedCheckpoint(e.target.value)}
          >
            <option value="">Select a checkpoint...</option>
            {checkpoints.map(cp => (
              <option key={cp.id} value={cp.id}>{cp.name}</option>
            ))}
          </select>
          <button onClick={handleLogPatrol} disabled={logging}>
            {logging ? "Logging..." : "Log Patrol"}
          </button>
        </div>
        {message && <p className="form-message">{message}</p>}
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
                    User {log.user_id} · {new Date(log.scanned_at).toLocaleString()}
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