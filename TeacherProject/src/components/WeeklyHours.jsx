import React, { useEffect, useState } from "react";
import "../styles/WeeklyHours.css";

const API_BASE_LIST = "http://192.168.100.92:5001";
const API_BASE_DETAIL = "http://192.168.100.92:21000";

/* ==============================
   HELPER: Avatar initials
============================== */
function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/* ==============================
   SCREEN 1: TEACHER LIST
============================== */
function TeachersList({ onSelect }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_LIST}/api/all-teachers`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTeachers(data.teachers);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="wh-loading">
        <div className="wh-spinner" />
        <p>Loading teachers...</p>
      </div>
    );
  }

  return (
    <div className="wh-container">
      <h2 className="wh-title">Teachers</h2>
      <div className="wh-list">
        {teachers.map((teacher, i) => (
          <div
            key={teacher.teacher_id}
            className="wh-card"
            style={{ animationDelay: `${i * 0.06}s` }}
            onClick={() => onSelect(teacher)}
          >
            <div className="wh-avatar">
              {getInitials(teacher.name)}
            </div>
            <span className="wh-name">{teacher.name}</span>
            <span className="wh-arrow">›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==============================
   SCREEN 2: TEACHER DETAIL
============================== */
function TeacherDetail({ teacher, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_DETAIL}/arrival_info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher_id: teacher.teacher_id }),
    })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [teacher.teacher_id]);

  /* Calculate weekly hours from arrival_info */
  const weeklyHours = data
    ? Object.values(data.arrival_info).reduce(
        (sum, d) => sum + (d.hours || 0),
        0
      )
    : 0;

  if (loading) {
    return (
      <div className="wh-loading">
        <div className="wh-spinner" />
        <p>Loading details...</p>
      </div>
    );
  }

  const dates = data ? Object.keys(data.arrival_info) : [];

  return (
    <div className="wh-container">
      {/* Back Button */}
      <button className="wh-back-btn" onClick={onBack}>
        ← Back
      </button>

      {/* Teacher Header */}
      <div className="wh-detail-header">
        <div className="wh-avatar wh-avatar-big">
          {getInitials(teacher.name)}
        </div>
        <div>
          <h2 className="wh-detail-name">{teacher.name}</h2>
          <p className="wh-weekly-hours">
            Weekly Hours: <strong>{weeklyHours.toFixed(2)}</strong>
          </p>
        </div>
      </div>

      {/* Date Cards */}
      {dates.length === 0 ? (
        <p className="wh-empty">No attendance data available.</p>
      ) : (
        <div className="wh-list">
          {dates.map((date, i) => {
            const info = data.arrival_info[date];

            /* Get day name */
            const dayName = new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
            });

            return (
              <div
                key={date}
                className="wh-detail-card"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="wh-detail-card-top">
                  <span className="wh-date">
                    {date} ({dayName})
                  </span>
                  <span className="wh-hours-badge">
                    {(info.hours || 0).toFixed(2)} hrs
                  </span>
                </div>

                {/* Timeline */}
                {info.timeline && info.timeline.length > 0 && (
                  <div className="wh-timeline">
                    {info.timeline.map((entry, j) => (
                      <div key={j} className="wh-timeline-entry">
                        <span className="wh-time-in">In: {entry.in}</span>
                        {entry.out && (
                          <span className="wh-time-out">Out: {entry.out}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==============================
   MAIN EXPORT
============================== */
export default function TeachersWeeklyHours() {
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  return (
    <div className="wh-wrapper">
      {/* Header */}
      <div className="wh-header">
        <div className="wh-header-content">
          <h1>
            {selectedTeacher ? "Attendance Detail" : "Weekly Hours"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="wh-body">
        {selectedTeacher ? (
          <TeacherDetail
            teacher={selectedTeacher}
            onBack={() => setSelectedTeacher(null)}
          />
        ) : (
          <TeachersList onSelect={setSelectedTeacher} />
        )}
      </div>
    </div>
  );
}