import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SlotTeachers() {
  const location = useLocation();
  const navigate = useNavigate();

  const { day, slot, floor_id, mode } = location.state || {};

  const [teachers,       setTeachers]       = useState([]);
  const [loading,        setLoading]         = useState(true);
  const [error,          setError]           = useState(null);
  const [activeTeachers, setActiveTeachers]  = useState({});

  const BASE          = "http://192.168.100.92:18000/chr";
  const SLOT_API      = "http://192.168.100.92:10000/slot_teachers";
  const TIMEIN_API    = `${BASE}/time_in`;
  const TIMEOUT_API   = `${BASE}/time_out`;
  const STATUS_API    = `${BASE}/status`;
  const SWAP_API      = `${BASE}/swap_status`;
  const NOT_HELD_API  = `${BASE}/mark_not_held`;

  const getKey = (t) => `${t.teacher_id}-${t.section_name}`;

  // ─── 12-hour → 24-hour ───────────────────────────────
  // Rule: hour >= 8 → AM (keep as is)
  //       hour <  8 → PM (add 12)
  // "8:30 - 9:30"  → 8:30 / 9:30
  // "12:30 - 1:30" → 12:30 / 13:30
  // "2:00 - 3:00"  → 14:00 / 15:00
  const to24h = (timeStr) => {
    const [h, m] = timeStr.trim().split(":").map(Number);
    return { h: h < 8 ? h + 12 : h, m };
  };

  const parseSlot = (slotStr) => {
    try {
      const parts = slotStr.trim().split("-");
      return { start: to24h(parts[0]), end: to24h(parts[1]) };
    } catch { return null; }
  };

  // ─── Slot end ho gaya? ───────────────────────────────
  const slotHasEnded = (slotStr) => {
    try {
      const { end } = parseSlot(slotStr);
      const now     = new Date();
      const endTime = new Date();
      endTime.setHours(end.h, end.m, 0, 0);
      return now > endTime;
    } catch { return false; }
  };

  // ─── Slot 10 min guzar gaye? ─────────────────────────
  const slotIsLate = (slotStr) => {
    try {
      const { start } = parseSlot(slotStr);
      const now       = new Date();
      const startTime = new Date();
      startTime.setHours(start.h, start.m, 0, 0);
      return (now - startTime) / 60000 > 10;
    } catch { return false; }
  };


  // ─── Fetch teachers + statuses ────────────────────────
  useEffect(() => {
    if (!day || !slot) {
      setError("Missing day or slot information.");
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const res  = await fetch(SLOT_API, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ day, slot, floor_id }),
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setTeachers(data);
        await fetchAllStatuses(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [day, slot, floor_id, mode]);


  // ─── Fetch status for all teachers ───────────────────
  const fetchAllStatuses = async (teacherList) => {
    const newActive = {};

    await Promise.all(
      teacherList.map(async (teacher) => {
        const key = getKey(teacher);
        try {
          // 1) CHR status
          const res  = await fetch(STATUS_API, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              teacher_id:   teacher.teacher_id,
              slot, day,
              section_name: teacher.section_name,
              venue:        teacher.venue,
            }),
          });
          const chrData = await res.json();

          // 2) Swap status (if timetable_id available)
          let isSwapped = false;
          if (teacher.timetable_id) {
            try {
              const sr  = await fetch(SWAP_API, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ timetable_id: teacher.timetable_id }),
              });
              const sd  = await sr.json();
              isSwapped = sd.is_swapped || false;
            } catch { /* swap check fail hone pe ignore */ }
          }

          // ── Build state ──────────────────────────────
          if (chrData.status === "Not Held") {
            newActive[key] = {
              active:    false,
              chr_id:    chrData.chr_id,
              time_in:   null,
              time_out:  null,
              duration:  "",
              status:    "Not Held",
              isSwapped,
            };
          } else if (chrData.chr_id && chrData.time_in && !chrData.time_out) {
            newActive[key] = {
              active:    true,
              chr_id:    chrData.chr_id,
              time_in:   chrData.time_in,
              time_out:  "",
              duration:  "",
              status:    chrData.status,   // 'Held' or 'Late'
              isSwapped,
            };
          } else if (chrData.chr_id && chrData.time_in && chrData.time_out) {
            const start = new Date(chrData.time_in.replace(" ", "T"));
            const end   = new Date(chrData.time_out.replace(" ", "T"));
            const diff  = Math.floor((end - start) / 60000);
            newActive[key] = {
              active:    false,
              chr_id:    chrData.chr_id,
              time_in:   chrData.time_in,
              time_out:  chrData.time_out,
              duration:  diff + " min",
              status:    chrData.status,
              isSwapped,
            };
          } else {
            // Koi record nahi abhi
            newActive[key] = {
              active:    false,
              chr_id:    null,
              time_in:   null,
              time_out:  null,
              duration:  "",
              status:    null,
              isSwapped,
            };
          }
        } catch (e) {
          console.error("Status check failed for", teacher.teacher_id, e);
        }
      })
    );

    setActiveTeachers(newActive);
  };


  // ─── Time In ─────────────────────────────────────────
  const handleTimeIn = async (teacher) => {
    try {
      const res  = await fetch(TIMEIN_API, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          teacher_id:   teacher.teacher_id,
          slot, day,
          section_name: teacher.section_name,
          venue:        teacher.venue,
        }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      setActiveTeachers((prev) => ({
        ...prev,
        [getKey(teacher)]: {
          ...prev[getKey(teacher)],
          active:   true,
          chr_id:   data.chr_id,
          time_in:  data.time_in,
          time_out: "",
          duration: "",
          status:   data.status,   // 'Held' or 'Late'
        },
      }));
    } catch (err) {
      console.error("Time In error:", err);
      setError("Server error");
    }
  };


  // ─── Time Out ────────────────────────────────────────
  const handleTimeOut = async (teacher) => {
    const current = activeTeachers[getKey(teacher)];
    if (!current?.chr_id) return;

    try {
      const res  = await fetch(TIMEOUT_API, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ chr_id: current.chr_id }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const start = new Date(current.time_in.replace(" ", "T"));
      const end   = new Date(data.time_out.replace(" ", "T"));
      const diff  = Math.floor((end - start) / 60000);

      setActiveTeachers((prev) => ({
        ...prev,
        [getKey(teacher)]: {
          ...current,
          active:   false,
          time_out: data.time_out,
          duration: diff + " min",
        },
      }));
    } catch (err) {
      console.error("Time Out error:", err);
      setError("Server error");
    }
  };


  // ─── Image ───────────────────────────────────────────
  const getImageSrc = (image) => {
    if (!image) return null;
    try {
      return image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
    } catch { return null; }
  };


  // ─── Filter ──────────────────────────────────────────
  // timein mode  → jo abhi timed-in nahi, Not Held nahi
  // timeout mode → jo active hain ya already timed-out
  const displayTeachers =
    mode === "timeout"
      ? teachers.filter((t) => {
          const s = activeTeachers[getKey(t)];
          return s?.active || s?.time_out;
        })
      : teachers.filter((t) => {
          const s = activeTeachers[getKey(t)];
          return !s?.active && !s?.time_out && s?.status !== "Not Held";
        });


  // ─── Status badge helper ─────────────────────────────
  const StatusBadge = ({ status, isSwapped }) => {
    if (isSwapped && !status) {
      return <span style={styles.badgeSwapped}>⇄ Swapped</span>;
    }
    if (status === "Late") {
      return <span style={styles.badgeLate}>⏰ Late</span>;
    }
    if (status === "Not Held") {
      return <span style={styles.badgeNotHeld}>✗ Not Held</span>;
    }
    if (status === "Held") {
      return <span style={styles.badgeHeld}>✓ Held</span>;
    }
    if (isSwapped) {
      return <span style={styles.badgeSwapped}>⇄ Swapped</span>;
    }
    return null;
  };


  // ─── Loading / Error / Empty states ──────────────────
  if (loading)
    return <div style={styles.center}>Loading...</div>;

  if (error)
    return (
      <div style={styles.center}>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>Go Back</button>
      </div>
    );

  if (!teachers.length)
    return (
      <div style={styles.center}>
        <p style={{ color: "#666" }}>No teachers found</p>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>Go Back</button>
      </div>
    );

  if (mode === "timeout" && displayTeachers.length === 0)
    return (
      <div style={styles.center}>
        <p style={{ color: "#666", textAlign: "center", padding: "0 20px" }}>
          No teacher has timed in yet for this slot.
        </p>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>Go Back</button>
      </div>
    );

  if (mode === "timein" && displayTeachers.length === 0)
    return (
      <div style={styles.center}>
        <p style={{ color: "#666", textAlign: "center", padding: "0 20px" }}>
          All teachers have already timed in for this slot.
        </p>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>Go Back</button>
      </div>
    );


  // ─── UI ──────────────────────────────────────────────
  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>←</button>
        <div>
          <h2 style={styles.heading}>{day} • {slot}</h2>
          <span style={{
            fontSize:     11,
            fontWeight:   "700",
            color:        "#fff",
            background:   mode === "timein" ? "#0f5d3b" : "#e65c00",
            padding:      "2px 8px",
            borderRadius: 5,
          }}>
            {mode === "timein" ? "⏱ TIME IN" : "⏹ TIME OUT"}
          </span>
        </div>
      </div>

      {/* TEACHERS LIST */}
      {displayTeachers.map((teacher) => {
        const imageSrc = getImageSrc(teacher.image);
        const state    = activeTeachers[getKey(teacher)] || {};
        const isActive = state.active;
        const isDone   = !!state.time_out;
        const isLate   = state.status === "Late";
        const notHeld  = state.status === "Not Held";
        const swapped  = state.isSwapped;

        // Card border/bg
        const cardBorder = notHeld  ? "#f44336"
                         : isLate   ? "#FF9800"
                         : swapped  ? "#9C27B0"
                         : isActive ? "#4CAF50"
                         : isDone   ? "#aaa"
                         : "#e0e0e0";

        const cardBg = notHeld  ? "#fff5f5"
                     : isLate   ? "#fff8f0"
                     : swapped  ? "#f8f0ff"
                     : isActive ? "#e8f5e9"
                     : isDone   ? "#f5f5f5"
                     : "#fff";

        return (
          <div
            key={getKey(teacher)}
            style={{
              ...styles.card,
              border:     `1px solid ${cardBorder}`,
              background: cardBg,
              opacity:    (isDone || notHeld) ? 0.8 : 1,
            }}
          >
            {/* IMAGE / AVATAR */}
            {imageSrc ? (
              <img
                src={imageSrc}
                alt=""
                style={styles.image}
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <div style={styles.avatar}>
                {teacher.full_name?.charAt(0)}
              </div>
            )}

            {/* INFO */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <div style={styles.name}>{teacher.full_name}</div>
                <StatusBadge status={state.status} isSwapped={swapped} />
              </div>
              <div style={styles.sub}>{teacher.venue} • {teacher.section_name}</div>
              {state.time_in  && <div style={styles.meta}>In: {state.time_in}</div>}
              {state.time_out && <div style={styles.meta}>Out: {state.time_out}</div>}
              {state.duration && <div style={styles.meta}>Duration: {state.duration}</div>}
            </div>

            {/* ACTION BUTTON */}
            <div style={{ flexShrink: 0 }}>
              {/* TIME IN mode */}
              {mode === "timein" && !isActive && !isDone && !notHeld && (
                <button style={styles.actionBtnGreen} onClick={() => handleTimeIn(teacher)}>
                  {slotIsLate(slot) ? "⏰ Late In" : "Time In"}
                </button>
              )}

              {/* TIME OUT mode */}
              {mode === "timeout" && (
                <>
                  {isActive && (
                    <button style={styles.actionBtnOrange} onClick={() => handleTimeOut(teacher)}>
                      Time Out
                    </button>
                  )}
                  {isDone && (
                    <span style={styles.badgeGrey}>✓ Out</span>
                  )}
                </>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}


// ═══════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════
const styles = {
  container: {
    minHeight:   "100vh",
    background:  "#eef3f0",
    padding:     "16px",
    fontFamily:  "Segoe UI, sans-serif",
  },
  header: {
    display:       "flex",
    alignItems:    "center",
    gap:           10,
    marginBottom:  16,
  },
  heading: {
    fontSize:   17,
    fontWeight: "700",
    color:      "#0f5d3b",
    margin:     "0 0 4px",
  },
  backBtn: {
    background:   "#d6eadf",
    border:       "none",
    borderRadius: 8,
    padding:      "6px 12px",
    color:        "#0f5d3b",
    fontWeight:   "700",
    cursor:       "pointer",
    fontSize:     16,
    flexShrink:   0,
  },
  center: {
    minHeight:      "100vh",
    display:        "flex",
    flexDirection:  "column",
    justifyContent: "center",
    alignItems:     "center",
    gap:            12,
    fontFamily:     "Segoe UI, sans-serif",
  },
  card: {
    display:       "flex",
    alignItems:    "center",
    gap:           12,
    padding:       14,
    borderRadius:  12,
    marginBottom:  10,
    boxShadow:     "0 2px 6px rgba(0,0,0,0.06)",
    transition:    "0.2s",
  },
  image: {
    width:        44,
    height:       44,
    borderRadius: "50%",
    objectFit:    "cover",
    flexShrink:   0,
  },
  avatar: {
    width:          44,
    height:         44,
    borderRadius:   "50%",
    background:     "#0f5d3b",
    color:          "#fff",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    fontWeight:     "700",
    fontSize:       18,
    flexShrink:     0,
  },
  name: {
    fontWeight:    "700",
    color:         "#0f5d3b",
    fontSize:      14,
    whiteSpace:    "nowrap",
    overflow:      "hidden",
    textOverflow:  "ellipsis",
  },
  sub: {
    fontSize:  12,
    color:     "#666",
    marginTop: 2,
  },
  meta: {
    fontSize:  12,
    color:     "#444",
    marginTop: 2,
  },
  actionBtnGreen: {
    background:   "#0f5d3b",
    color:        "#fff",
    border:       "none",
    borderRadius: 8,
    padding:      "7px 13px",
    fontSize:     12,
    fontWeight:   "700",
    cursor:       "pointer",
    whiteSpace:   "nowrap",
  },
  actionBtnOrange: {
    background:   "#e65c00",
    color:        "#fff",
    border:       "none",
    borderRadius: 8,
    padding:      "7px 13px",
    fontSize:     12,
    fontWeight:   "700",
    cursor:       "pointer",
    whiteSpace:   "nowrap",
  },
  badgeGrey: {
    background:   "#f0f0f0",
    color:        "#888",
    border:       "1px solid #ccc",
    borderRadius: 7,
    padding:      "5px 10px",
    fontSize:     11,
    fontWeight:   "700",
  },
  badgeHeld: {
    background:   "#e8f5e9",
    color:        "#2e7d32",
    border:       "1px solid #4CAF50",
    borderRadius: 6,
    padding:      "2px 7px",
    fontSize:     10,
    fontWeight:   "700",
  },
  badgeLate: {
    background:   "#fff3e0",
    color:        "#e65c00",
    border:       "1px solid #FF9800",
    borderRadius: 6,
    padding:      "2px 7px",
    fontSize:     10,
    fontWeight:   "700",
  },
  badgeNotHeld: {
    background:   "#ffebee",
    color:        "#c62828",
    border:       "1px solid #f44336",
    borderRadius: 6,
    padding:      "2px 7px",
    fontSize:     10,
    fontWeight:   "700",
  },
  badgeSwapped: {
    background:   "#f3e5f5",
    color:        "#6a1b9a",
    border:       "1px solid #9C27B0",
    borderRadius: 6,
    padding:      "2px 7px",
    fontSize:     10,
    fontWeight:   "700",
  },
};