import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/gate_verify.css";

const API_BASE = "http://192.168.100.92:8000";

export default function ManualVerify() {
  const location = useLocation();
  const admin_id = location.state?.admin_id;

  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [manualAction, setManualAction] = useState("time_in");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingTeachers, setFetchingTeachers] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setFetchingTeachers(true);
    try {
      const res = await fetch(`${API_BASE}/api/all-teachers`);
      if (!res.ok) throw new Error("Failed to fetch teachers");
      const data = await res.json();
      setTeachers(data.teachers || []);
    } catch (e) {
      showToast("error", "Could not load teacher list: " + e.message);
    } finally {
      setFetchingTeachers(false);
    }
  };

  const showToast = (type, message) => setToast({ type, message });
  const closeToast = () => setToast(null);

  const sendManualAttendance = async () => {
    if (!selectedTeacher) {
      showToast("error", "Please select a teacher first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("teacher_id", selectedTeacher);
    formData.append("action", manualAction);
    if (note) formData.append("note", note);

    try {
      const response = await fetch(`${API_BASE}/manual_attendance`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        showToast("error", `Server error ${response.status}: ${err.substring(0, 200)}`);
        return;
      }

      const data = await response.json();

      if (data.result) {
        const r = data.result;
        let msg = `${r.teacher_name}\n${r.action?.toUpperCase()} at ${r.time}`;
        if (r.duration) msg += `\nDuration: ${r.duration} min`;
        if (note) msg += `\nNote: ${note}`;
        showToast("success", msg);
      } else {
        showToast("error", data.error || "Something went wrong.");
      }

      // Reset form
      setSelectedTeacher("");
      setManualAction("time_in");
      setNote("");

    } catch (error) {
      showToast("error", "Network Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gate-container">
      <div className="gate-inner">

        {/* ── HEADER ── */}
        <div className="gate-header">
          <div className="gate-icon-wrap">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 6l-1-2H5v17h2v-7h5l1 2h7V6h-6zm4 8h-4l-1-2H7V6h5l1 2h5v6z"/>
            </svg>
          </div>
          <div className="gate-title-wrap">
            <h1>Manual Attendance</h1>
            <p>Select teacher and mark attendance manually</p>
          </div>
        </div>

        <hr className="gate-divider" />

        {/* ── TEACHER SELECT ── */}
        <div className="manual-field">
          <label className="manual-label">Select Teacher</label>
          {fetchingTeachers ? (
            <div className="manual-loading-text">Loading teachers...</div>
          ) : (
            <select
              className="manual-select"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="">-- Choose Teacher --</option>
              {teachers.map((t) => (
                <option key={t.teacher_id} value={t.teacher_id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ── TIME IN / OUT TOGGLE ── */}
        <div className="manual-field">
          <label className="manual-label">Action</label>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${manualAction === "time_in" ? "toggle-active-in" : ""}`}
              onClick={() => setManualAction("time_in")}
            >
              Time In
            </button>
            <button
              className={`toggle-btn ${manualAction === "time_out" ? "toggle-active-out" : ""}`}
              onClick={() => setManualAction("time_out")}
            >
              Time Out
            </button>
          </div>
        </div>

        {/* ── NOTE ── */}
        <div className="manual-field">
          <label className="manual-label">Note (Optional)</label>
          <input
            type="text"
            className="manual-input"
            placeholder="e.g. Manual override"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* ── SUBMIT BUTTON ── */}
        <button className="send-button" onClick={sendManualAttendance} disabled={loading}>
          {loading ? "Saving..." : (
            <>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              MARK ATTENDANCE
            </>
          )}
        </button>

        {/* ── TOAST ── */}
        {toast && (
          <div className="toast-overlay">
            <div className="toast-box">
              <div className="toast-header">
                <span className={`toast-dot ${toast.type}`} />
                <span className="toast-title">
                  {toast.type === "success" ? "Attendance Marked" : "Notice"}
                </span>
              </div>
              <div className="toast-body">{toast.message}</div>
              <button className="toast-close" onClick={closeToast}>OK</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}