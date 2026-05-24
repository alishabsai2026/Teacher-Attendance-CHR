import React, { useEffect, useState } from "react";
import "../styles/overallSummary.css";

const API_BASE = "http://192.168.100.92:5000";

export default function OverallSummary() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/chr/overall-summary`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.summary);
        else setError("Data load nahi hua");
        setLoading(false);
      })
      .catch(() => {
        setError("Server se connection nahi ho saka");
        setLoading(false);
      });
  }, []);

  const filtered = data.filter((d) =>
    d.full_name.toLowerCase().includes(search.toLowerCase())
  );

  // Totals
  const totalClasses  = filtered.reduce((s, d) => s + d.total_classes, 0);
  const totalHeld     = filtered.reduce((s, d) => s + d.held, 0);
  const totalNotHeld  = filtered.reduce((s, d) => s + d.not_held, 0);
  const totalLate     = filtered.reduce((s, d) => s + d.late, 0);
  const totalSwapped  = filtered.reduce((s, d) => s + d.swapped, 0);

  return (
    <div className="os-wrapper">

      {/* HEADER */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h2>Overall Summary</h2>
        </div>
      </div>

      <div className="os-body">
        <div className="os-container">

          {/* Search */}
          <div className="os-search-row">
            <input
              type="text"
              placeholder="Search teacher..."
              className="os-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Stats Bar */}
          {!loading && data.length > 0 && (
            <div className="os-summary">
              <div className="os-stat os-stat-total">
                <span className="os-stat-count">{totalClasses}</span>
                <span className="os-stat-label">Total Classes</span>
              </div>
              <div className="os-stat os-stat-held">
                <span className="os-stat-count">{totalHeld}</span>
                <span className="os-stat-label">Held</span>
              </div>
              <div className="os-stat os-stat-notheld">
                <span className="os-stat-count">{totalNotHeld}</span>
                <span className="os-stat-label">Not Held</span>
              </div>
              <div className="os-stat os-stat-late">
                <span className="os-stat-count">{totalLate}</span>
                <span className="os-stat-label">Late</span>
              </div>
              <div className="os-stat os-stat-swapped">
                <span className="os-stat-count">{totalSwapped}</span>
                <span className="os-stat-label">Swapped</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && <div className="os-error">{error}</div>}

          {/* Loading */}
          {loading && (
            <div className="os-loading">
              <div className="os-spinner" />
              <p>Loading summary...</p>
            </div>
          )}

          {/* Table */}
          {!loading && filtered.length > 0 && (
            <div className="os-table-wrapper">
              <table className="os-table">
                <thead>
                  <tr>
                    <th>Sr#</th>
                    <th>Teacher</th>
                    <th>Total Classes</th>
                    <th>Held</th>
                    <th>Not Held</th>
                    <th>Late</th>
                    <th>Swapped</th>
                    <th>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "os-row-even" : "os-row-odd"}>
                      <td>{idx + 1}</td>
                      <td className="os-td-name">{item.full_name}</td>
                      <td>{item.total_classes}</td>
                      <td className="os-held">{item.held}</td>
                      <td className="os-notheld">{item.not_held}</td>
                      <td className="os-late">{item.late}</td>
                      <td className="os-swapped">{item.swapped}</td>
                      <td className="os-hours">{item.total_hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length === 0 && !error && (
            <p className="os-empty">No record found.</p>
          )}

        </div>
      </div>
    </div>
  );
}