import React, { useEffect, useState } from "react";
import "../styles/weeklyLowHours.css";

const API_BASE = "http://192.168.100.92:5003";

export default function WeeklyLowHours() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [date, setDate]         = useState(
    new Date().toISOString().split("T")[0]
  );

  const fetchData = (selectedDate) => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/chr/low-hours?date=${selectedDate}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setTeachers(json.teachers);
        else setError("Data load nahi hua");
        setLoading(false);
      })
      .catch(() => {
        setError("Server se connection nahi ho saka");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(date);
  }, []);

  const handleDateChange = (e) => {
    setDate(e.target.value);
    fetchData(e.target.value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  return (
    <div className="wlh-wrapper">

      {/* HEADER */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h2>Low Hours Report</h2>
        </div>
      </div>

      <div className="wlh-body">
        <div className="wlh-container">

          {/* Date Picker */}
          <div className="wlh-date-row">
            <span className="wlh-date-label">
              📅 Selected Date: <strong>{formatDate(date)}</strong>
            </span>
            <input
              type="date"
              className="wlh-date-input"
              value={date}
              onChange={handleDateChange}
            />
          </div>

          {/* Summary */}
          {!loading && (
            <div className="wlh-summary">
              <div className="wlh-stat">
                <span className="wlh-stat-count">{teachers.length}</span>
                <span className="wlh-stat-label">Teachers Below 8hrs</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && <div className="wlh-error">{error}</div>}

          {/* Loading */}
          {loading && (
            <div className="wlh-loading">
              <div className="wlh-spinner" />
              <p>Loading...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && teachers.length === 0 && (
            <div className="wlh-empty">
              ✅ All teachers completed 8+ hours on this day!
            </div>
          )}

          {/* Table */}
          {!loading && teachers.length > 0 && (
            <div className="wlh-table-wrapper">
              <table className="wlh-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Teacher Name</th>
                    <th>Total Hours</th>
                    <th>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t, index) => {
                    const pct = Math.min((t.total_hours / 8) * 100, 100);
                    return (
                      <tr key={t.user_id} className="wlh-row">
                        <td className="wlh-td-sr">{index + 1}</td>
                        <td className="wlh-td-name">{t.full_name}</td>
                        <td className="wlh-td-hours">
                          <div className="wlh-hours-wrap">
                            <span className="wlh-hours-text">{t.hours_display}</span>
                            <div className="wlh-progress-bar">
                              <div
                                className="wlh-progress-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="wlh-td-remaining">{t.remaining} left</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}