import React, { useEffect, useState } from "react";
import "../styles/todayStatus.css";

const API_BASE = "http://192.168.100.92:5002";

const AVATAR_COLORS = [
  "#0f5d3b", "#1565c0", "#6a1b9a", "#ad1457",
  "#e65100", "#2e7d32", "#00838f", "#4527a0"
];

const getColor = (name) => {
  let sum = 0;
  for (let c of name) sum += c.charCodeAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const Avatar = ({ teacher }) => {
  const [imgError, setImgError] = useState(false);

  if (teacher.image_url && !imgError) {
    return (
      <img
        src={teacher.image_url}
        alt={teacher.full_name}
        className="ts-avatar-img"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="ts-avatar-initials"
      style={{ background: getColor(teacher.full_name) }}
    >
      {teacher.initials}
    </div>
  );
};

export default function TodayStatus() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/chr/today-status`)
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
  }, []);

  const filtered = teachers
    .filter((t) => {
      if (filter === "all")    return true;
      if (filter === "inside") return t.status === "inside";
      if (filter === "left")   return t.status === "left";
      if (filter === "absent") return t.status === "absent";
      return true;
    })
    .filter((t) =>
      t.full_name.toLowerCase().includes(search.toLowerCase())
    );

  const totalCount  = teachers.length;
  const insideCount = teachers.filter((t) => t.status === "inside").length;
  const leftCount   = teachers.filter((t) => t.status === "left").length;
  const absentCount = teachers.filter((t) => t.status === "absent").length;

  return (
    <div className="ts-wrapper">

      {/* HEADER */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h2>Today's Teacher Status</h2>
        </div>
      </div>

      <div className="ts-body">
        <div className="ts-container">

          {/* Summary Bar */}
          {!loading && (
            <div className="ts-summary">
              <div className="ts-stat ts-stat-total">
                <span className="ts-stat-count">{totalCount}</span>
                <span className="ts-stat-label">Total Teachers</span>
              </div>
              <div className="ts-stat ts-stat-inside">
                <span className="ts-stat-count">{insideCount}</span>
                <span className="ts-stat-label">Inside</span>
              </div>
              <div className="ts-stat ts-stat-left">
                <span className="ts-stat-count">{leftCount}</span>
                <span className="ts-stat-label">Left</span>
              </div>
              <div className="ts-stat ts-stat-absent">
                <span className="ts-stat-count">{absentCount}</span>
                <span className="ts-stat-label">Not Arrived</span>
              </div>
            </div>
          )}

          {/* Search + Filter Row */}
          {!loading && (
            <div className="ts-controls">
              <input
                type="text"
                placeholder="Search teacher..."
                className="ts-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="ts-filters">
                {[
                  { key: "all",    label: "All"          },
                  { key: "inside", label: "🟢 Inside"    },
                  { key: "left",   label: "🔵 Left"      },
                  { key: "absent", label: "⚪ Not Arrived"},
                ].map((f) => (
                  <button
                    key={f.key}
                    className={`ts-filter-btn ts-filter-${f.key} ${filter === f.key ? "active" : ""}`}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && <div className="ts-error">{error}</div>}

          {/* Loading */}
          {loading && (
            <div className="ts-loading">
              <div className="ts-spinner" />
              <p>Loading...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && !error && (
            <p className="ts-empty">No teacher found.</p>
          )}

          {/* Grid */}
          {!loading && filtered.length > 0 && (
            <div className="ts-grid">
              {filtered.map((teacher) => (
                <div
                  key={teacher.user_id}
                  className={`ts-card ts-card-${teacher.status}`}
                >
                  <div className="ts-avatar-wrapper">
                    <Avatar teacher={teacher} />
                    <span className={`ts-dot ts-dot-${teacher.status}`} />
                  </div>
                  <div className="ts-info">
                    <p className="ts-name">{teacher.full_name}</p>
                    {teacher.time_in && (
                      <p className="ts-time">
                        In: {teacher.time_in}
                        {teacher.time_out
                          ? <> &mdash; Out: {teacher.time_out}</>
                          : ""}
                      </p>
                    )}
                    {!teacher.time_in && (
                      <p className="ts-time ts-absent-text">Not Arrived</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}