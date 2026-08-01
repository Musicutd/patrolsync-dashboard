import React, { useEffect, useState } from "react";
import "./style.css";

const API_URL = "https://patrolsync-backend.onrender.com";

export default function App() {
  const [sites, setSites] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const tenantId = 1;

    fetch(`${API_URL}/api/sites?tenant_id=${tenantId}`)
      .then(r => r.json())
      .then(setSites);

    fetch(`${API_URL}/api/checkpoints?tenant_id=${tenantId}`)
      .then(r => r.json())
      .then(setCheckpoints);

    fetch(`${API_URL}/api/patrol-logs?tenant_id=${tenantId}`)
      .then(r => r.json())
      .then(setLogs);
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>PatrolSync Dashboard</h1>
        <span className="badge">Tenant #1</span>
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