import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API = "http://192.168.100.92:2000";

const Leave = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const teacherId = location.state?.teacher_id;
  const teacherName = location.state?.name || "Teacher";

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please write a reason before sending.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/submit-leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_id: teacherId, reason }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        setReason("");
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Could not connect to server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* ===== HEADER ===== */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h2 style={styles.headerTitle}>Apply for Leave</h2>
      </div>

      {/* ===== CARD ===== */}
      <div style={styles.card}>
        <p style={styles.greeting}>Hello, <strong>{teacherName}</strong></p>
        <p style={styles.subtext}>Write your leave reason below and notify the admin.</p>

        {/* ===== SUCCESS STATE ===== */}
        {submitted ? (
          <div style={styles.successBox}>
            <span style={styles.successIcon}>✅</span>
            <p style={styles.successText}>Your leave request has been sent to admin!</p>
            <button style={styles.anotherBtn} onClick={() => setSubmitted(false)}>
              Send Another
            </button>
          </div>
        ) : (
          <>
            {/* ===== TEXTAREA ===== */}
            <textarea
              style={styles.textarea}
              placeholder="e.g. I am feeling unwell and cannot attend today..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              rows={5}
            />

            {/* ===== ERROR ===== */}
            {error && <p style={styles.errorText}>{error}</p>}

            {/* ===== SEND BUTTON ===== */}
            <button
              style={{ ...styles.sendBtn, opacity: loading ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Sending..." : "📨 Send to Admin"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ===== STYLES =====
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    fontFamily: "sans-serif",
  },
  header: {
    backgroundColor: "#1a1a2e",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerTitle: {
    color: "#fff",
    fontSize: "18px",
    margin: 0,
  },
  backBtn: {
    background: "transparent",
    border: "1px solid #fff",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  card: {
    backgroundColor: "#fff",
    margin: "30px auto",
    padding: "28px",
    borderRadius: "12px",
    maxWidth: "520px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  greeting: {
    fontSize: "16px",
    marginBottom: "6px",
    color: "#333",
  },
  subtext: {
    fontSize: "13px",
    color: "#777",
    marginBottom: "20px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    color: "#333",
  },
  errorText: {
    color: "red",
    fontSize: "13px",
    marginTop: "8px",
  },
  sendBtn: {
    marginTop: "18px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#f0a500",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  successBox: {
    textAlign: "center",
    padding: "20px 0",
  },
  successIcon: {
    fontSize: "40px",
  },
  successText: {
    fontSize: "15px",
    color: "#333",
    margin: "12px 0 20px",
  },
  anotherBtn: {
    padding: "10px 24px",
    backgroundColor: "#1a1a2e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Leave;