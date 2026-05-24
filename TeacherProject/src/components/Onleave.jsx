import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://192.168.100.92:2000";

const OnLeave = () => {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===== FETCH ON-LEAVE TEACHERS =====
  const fetchOnLeaveTeachers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/on-leave-teachers`);
      const data = await res.json();
      if (data.success) {
        setTeachers(data.teachers);
      } else {
        setError("Failed to load data.");
      }
    } catch (err) {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnLeaveTeachers();
  }, []);

  // ===== FORMAT DATE =====
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={styles.page}>
      {/* ===== HEADER ===== */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h2 style={styles.headerTitle}>On Leave Teachers</h2>
        <button style={styles.refreshBtn} onClick={fetchOnLeaveTeachers}>↻ Refresh</button>
      </div>

      <div style={styles.content}>

        {/* ===== LOADING ===== */}
        {loading && (
          <div style={styles.centered}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Loading...</p>
          </div>
        )}

        {/* ===== ERROR ===== */}
        {!loading && error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>⚠️ {error}</p>
            <button style={styles.retryBtn} onClick={fetchOnLeaveTeachers}>Retry</button>
          </div>
        )}

        {/* ===== EMPTY STATE ===== */}
        {!loading && !error && teachers.length === 0 && (
          <div style={styles.centered}>
            <p style={styles.emptyIcon}>🎉</p>
            <p style={styles.emptyText}>No teachers are on leave today.</p>
          </div>
        )}

        {/* ===== COUNT BADGE ===== */}
        {!loading && teachers.length > 0 && (
          <p style={styles.countBadge}>
            {teachers.length} teacher{teachers.length > 1 ? "s" : ""} on leave
          </p>
        )}

        {/* ===== TEACHER CARDS ===== */}
        {!loading && teachers.map((t) => (
          <div key={t.id} style={styles.card}>
            <div style={styles.cardLeft}>
              <div style={styles.avatar}>
                {t.teacher_name?.charAt(0).toUpperCase() || "T"}
              </div>
            </div>
            <div style={styles.cardRight}>
              <p style={styles.teacherName}>{t.teacher_name}</p>
              <p style={styles.teacherId}>ID: {t.teacher_id}</p>
              <p style={styles.reason}>📝 {t.reason}</p>
              <p style={styles.date}>🕐 {formatDate(t.submitted_at)}</p>
            </div>
          </div>
        ))}

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
    justifyContent: "space-between",
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
  refreshBtn: {
    background: "#f0a500",
    border: "none",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  content: {
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  centered: {
    textAlign: "center",
    marginTop: "60px",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "4px solid #ddd",
    borderTop: "4px solid #1a1a2e",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto 12px",
  },
  loadingText: {
    color: "#888",
    fontSize: "14px",
  },
  errorBox: {
    textAlign: "center",
    marginTop: "60px",
  },
  errorText: {
    color: "#cc0000",
    fontSize: "15px",
    marginBottom: "12px",
  },
  retryBtn: {
    padding: "8px 20px",
    backgroundColor: "#1a1a2e",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  emptyIcon: {
    fontSize: "48px",
  },
  emptyText: {
    color: "#666",
    fontSize: "15px",
    marginTop: "8px",
  },
  countBadge: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "14px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
  },
  cardLeft: {
    flexShrink: 0,
  },
  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    backgroundColor: "#1a1a2e",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "bold",
  },
  cardRight: {
    flex: 1,
  },
  teacherName: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#1a1a2e",
    margin: "0 0 2px",
  },
  teacherId: {
    fontSize: "12px",
    color: "#aaa",
    margin: "0 0 8px",
  },
  reason: {
    fontSize: "14px",
    color: "#444",
    margin: "0 0 6px",
    lineHeight: "1.4",
  },
  date: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
  },
};

export default OnLeave;