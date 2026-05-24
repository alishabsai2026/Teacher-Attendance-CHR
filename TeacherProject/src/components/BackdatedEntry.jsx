import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SLOTS = [
  "8:30 - 9:30",
  "9:30 - 10:30",
  "10:30 - 11:30",
  "11:30 - 12:30",
  "12:30 - 1:30",
  "2:00 - 3:00",
  "3:00 - 4:00",
];

const FLOORS = [
  { id: 1, name: "Basement" },
  { id: 2, name: "Ground Floor" },
  { id: 3, name: "1st Floor" },
  { id: 4, name: "2nd Floor" },
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function slotDefaults(slotStr) {
  try {
    const parts = slotStr.split("-").map((s) => s.trim());
    const toHHMM = (s) => {
      let [h, m] = s.split(":").map(Number);
      if (h < 8) h += 12;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };
    return { timeIn: toHHMM(parts[0]), timeOut: toHHMM(parts[1]) };
  } catch {
    return { timeIn: "", timeOut: "" };
  }
}

const BASE     = "http://192.168.100.92:19000/backdated";
const SLOT_API = "http://192.168.100.92:10000/slot_teachers";

export default function BackdatedEntry() {
  const navigate = useNavigate();

  const [step,          setStep]    = useState(1);
  const [selectedDate,  setDate]    = useState("");
  const [selectedSlot,  setSlot]    = useState("");
  const [selectedFloor, setFloor]   = useState("");
  const [dayName,       setDayName] = useState("");

  const [teachers, setTeachers] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [entries,  setEntries]  = useState({});

  const getKey = (t) => `${t.teacher_id}-${t.section_name}`;

  const handleDateChange = (val) => {
    setDate(val);
    if (val) {
      const d = new Date(val + "T00:00:00");
      setDayName(DAY_NAMES[d.getDay()]);
    } else {
      setDayName("");
    }
  };

  const handleFetch = async () => {
    if (!selectedDate || !selectedSlot || !selectedFloor) {
      setError("Date, slot and floor are required.");
      return;
    }
    if (dayName === "Sunday" || dayName === "Saturday") {
      setError("No classes on weekends!");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(SLOT_API, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          day:      dayName,
          slot:     selectedSlot,
          floor_id: parseInt(selectedFloor),
        }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setTeachers(data);

      const defs = slotDefaults(selectedSlot);
      const init = {};
      data.forEach((t) => {
        init[getKey(t)] = {
          timeIn:  defs.timeIn,
          timeOut: defs.timeOut,
          status:  "Held",
          saving:  false,
          saved:   false,
          error:   null,
        };
      });
      setEntries(init);
      setStep(2);
    } catch (e) {
      setError("Failed to load teachers. Please check the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (teacher) => {
    const key   = getKey(teacher);
    const entry = entries[key];

    if (entry.status !== "Not Held" && !entry.timeIn) {
      setEntries((p) => ({ ...p, [key]: { ...p[key], error: "Time In is required." } }));
      return;
    }

    const buildDT = (t) => `${selectedDate} ${t}:00`;

    setEntries((p) => ({ ...p, [key]: { ...p[key], saving: true, error: null } }));

    try {
      const res = await fetch(`${BASE}/entry`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          teacher_id:   teacher.teacher_id,
          slot:         selectedSlot,
          day:          dayName,
          section_name: teacher.section_name,
          venue:        teacher.venue,
          entry_date:   selectedDate,
          time_in:      entry.status === "Not Held" ? null : buildDT(entry.timeIn),
          time_out:     entry.status === "Not Held" ? null : (entry.timeOut ? buildDT(entry.timeOut) : null),
          status:       entry.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");

      setEntries((p) => ({ ...p, [key]: { ...p[key], saving: false, saved: true } }));
    } catch (e) {
      setEntries((p) => ({ ...p, [key]: { ...p[key], saving: false, error: e.message } }));
    }
  };

  const handleSaveAll = () => {
    teachers.forEach((t) => {
      const key = getKey(t);
      if (!entries[key]?.saved) handleSave(t);
    });
  };

  const getImgSrc = (img) => {
    if (!img) return null;
    return img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`;
  };

  const savedCount = Object.values(entries).filter((e) => e.saved).length;

  return (
    <div style={s.container}>

      {/* HEADER */}
      <div style={s.header}>
        <button onClick={() => step === 2 ? setStep(1) : navigate(-1)} style={s.backBtn}>←</button>
        <div>
          <h2 style={s.heading}>Backdated Entry</h2>
          <span style={s.subHeading}>Manually add record for a previous date</span>
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div style={s.card}>

          <div style={s.fieldGroup}>
            <label style={s.label}>📅 Select Date</label>
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => handleDateChange(e.target.value)}
              style={s.input}
            />
            {dayName && (
              <span style={{
                ...s.dayBadge,
                background: (dayName === "Saturday" || dayName === "Sunday") ? "#ffebee" : "#e8f5e9",
                color:      (dayName === "Saturday" || dayName === "Sunday") ? "#c62828" : "#0f5d3b",
              }}>
                {dayName === "Saturday" || dayName === "Sunday" ? "⚠ " : "📆 "}
                {dayName}
              </span>
            )}
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>🕐 Select Slot</label>
            <div style={s.slotGrid}>
              {SLOTS.map((sl) => (
                <button
                  key={sl}
                  style={{
                    ...s.slotBtn,
                    ...(selectedSlot === sl ? s.slotBtnActive : {}),
                  }}
                  onClick={() => setSlot(sl)}
                >
                  {sl}
                </button>
              ))}
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>🏢 Select Floor</label>
            <div style={s.floorGrid}>
              {FLOORS.map((f) => (
                <button
                  key={f.id}
                  style={{
                    ...s.floorBtn,
                    ...(selectedFloor === String(f.id) ? s.floorBtnActive : {}),
                  }}
                  onClick={() => setFloor(String(f.id))}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {error && <p style={s.errorText}>{error}</p>}

          <button
            style={{ ...s.primaryBtn, opacity: loading ? 0.7 : 1 }}
            onClick={handleFetch}
            disabled={loading}
          >
            {loading ? "Loading..." : "View Teachers →"}
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <div style={s.infoBar}>
            <span style={s.infoText}>📅 {selectedDate} • {dayName}</span>
            <span style={s.infoText}>🕐 {selectedSlot}</span>
            <span style={s.infoText}>✅ {savedCount}/{teachers.length} Saved</span>
          </div>

          {teachers.length > 0 && (
            <button style={s.saveAllBtn} onClick={handleSaveAll}>
              💾 Save All
            </button>
          )}

          {teachers.length === 0 && (
            <div style={s.emptyBox}>
              <p style={{ color: "#666" }}>No teachers found for this slot.</p>
            </div>
          )}

          {teachers.map((teacher) => {
            const key       = getKey(teacher);
            const entry     = entries[key] || {};
            const img       = getImgSrc(teacher.image);
            const isNotHeld = entry.status === "Not Held";

            return (
              <div
                key={key}
                style={{
                  ...s.teacherCard,
                  border:     entry.saved  ? "1px solid #4CAF50"
                            : entry.error  ? "1px solid #f44336"
                            : "1px solid #e0e0e0",
                  background: entry.saved  ? "#e8f5e9"
                            : entry.error  ? "#fff5f5"
                            : "#fff",
                }}
              >
                {img ? (
                  <img src={img} alt="" style={s.avatar}
                    onError={(e) => (e.target.style.display = "none")} />
                ) : (
                  <div style={s.avatarFallback}>
                    {teacher.full_name?.charAt(0)}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.teacherName}>{teacher.full_name}</div>
                  <div style={s.teacherSub}>{teacher.venue} • {teacher.section_name}</div>

                  {!entry.saved && (
                    <div style={s.timeRow}>

                      <div style={s.timeField}>
                        <label style={s.timeLabel}>Time In</label>
                        <input
                          type="time"
                          value={isNotHeld ? "" : (entry.timeIn || "")}
                          disabled={isNotHeld}
                          onChange={(e) =>
                            setEntries((p) => ({
                              ...p,
                              [key]: { ...p[key], timeIn: e.target.value },
                            }))
                          }
                          style={{
                            ...s.timeInput,
                            background: isNotHeld ? "#f5f5f5" : "#fff",
                            color:      isNotHeld ? "#aaa"    : "#333",
                          }}
                        />
                      </div>

                      <div style={s.timeField}>
                        <label style={s.timeLabel}>Time Out</label>
                        <input
                          type="time"
                          value={isNotHeld ? "" : (entry.timeOut || "")}
                          disabled={isNotHeld}
                          onChange={(e) =>
                            setEntries((p) => ({
                              ...p,
                              [key]: { ...p[key], timeOut: e.target.value },
                            }))
                          }
                          style={{
                            ...s.timeInput,
                            background: isNotHeld ? "#f5f5f5" : "#fff",
                            color:      isNotHeld ? "#aaa"    : "#333",
                          }}
                        />
                      </div>

                      <div style={s.timeField}>
                        <label style={s.timeLabel}>Status</label>
                        <select
                          value={entry.status || "Held"}
                          onChange={(e) =>
                            setEntries((p) => ({
                              ...p,
                              [key]: { ...p[key], status: e.target.value },
                            }))
                          }
                          style={s.statusSelect}
                        >
                          <option value="Held">Held</option>
                          <option value="Late">Late</option>
                          <option value="Not Held">Not Held</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {entry.error && <p style={s.entryError}>{entry.error}</p>}

                  {entry.saved && (
                    <p style={s.savedText}>
                      ✓ Saved —{" "}
                      {entry.status === "Not Held"
                        ? "Not Held"
                        : `In: ${entry.timeIn} • Out: ${entry.timeOut} • ${entry.status}`}
                    </p>
                  )}
                </div>

                {!entry.saved && (
                  <button
                    style={{ ...s.saveBtn, opacity: entry.saving ? 0.6 : 1 }}
                    onClick={() => handleSave(teacher)}
                    disabled={entry.saving}
                  >
                    {entry.saving ? "..." : "Save"}
                  </button>
                )}

                {entry.saved && (
                  <span style={s.savedBadge}>✓</span>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

const s = {
  container: {
    minHeight:  "100vh",
    background: "#eef3f0",
    padding:    "16px",
    fontFamily: "Segoe UI, sans-serif",
  },
  header: {
    display:      "flex",
    alignItems:   "center",
    gap:          10,
    marginBottom: 16,
  },
  heading: {
    fontSize:   17,
    fontWeight: "700",
    color:      "#0f5d3b",
    margin:     "0 0 2px",
  },
  subHeading: {
    fontSize: 11,
    color:    "#666",
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
  card: {
    background:    "#fff",
    borderRadius:  14,
    padding:       16,
    boxShadow:     "0 2px 8px rgba(0,0,0,0.07)",
    display:       "flex",
    flexDirection: "column",
    gap:           16,
  },
  fieldGroup: {
    display:       "flex",
    flexDirection: "column",
    gap:           8,
  },
  label: {
    fontSize:   13,
    fontWeight: "700",
    color:      "#0f5d3b",
  },
  input: {
    padding:      "10px 12px",
    borderRadius: 10,
    border:       "1.5px solid #c8ddd2",
    fontSize:     14,
    color:        "#333",
    outline:      "none",
    width:        "100%",
    boxSizing:    "border-box",
  },
  dayBadge: {
    display:      "inline-block",
    padding:      "4px 10px",
    borderRadius: 8,
    fontSize:     12,
    fontWeight:   "700",
    width:        "fit-content",
  },
  slotGrid: {
    display:             "grid",
    gridTemplateColumns: "1fr 1fr",
    gap:                 8,
  },
  slotBtn: {
    padding:      "10px 8px",
    borderRadius: 10,
    border:       "1.5px solid #c8ddd2",
    background:   "#fff",
    color:        "#0f5d3b",
    fontSize:     12,
    fontWeight:   "600",
    cursor:       "pointer",
    textAlign:    "center",
  },
  slotBtnActive: {
    background: "#0f5d3b",
    color:      "#fff",
    border:     "1.5px solid #0f5d3b",
  },
  floorGrid: {
    display:             "grid",
    gridTemplateColumns: "1fr 1fr",
    gap:                 8,
  },
  floorBtn: {
    padding:      "10px 8px",
    borderRadius: 10,
    border:       "1.5px solid #c8ddd2",
    background:   "#fff",
    color:        "#0f5d3b",
    fontSize:     12,
    fontWeight:   "600",
    cursor:       "pointer",
    textAlign:    "center",
  },
  floorBtnActive: {
    background: "#0f5d3b",
    color:      "#fff",
    border:     "1.5px solid #0f5d3b",
  },
  primaryBtn: {
    background:   "#0f5d3b",
    color:        "#fff",
    border:       "none",
    borderRadius: 10,
    padding:      "13px",
    fontSize:     14,
    fontWeight:   "700",
    cursor:       "pointer",
    width:        "100%",
  },
  errorText: {
    color:     "#c62828",
    fontSize:  12,
    margin:    0,
    textAlign: "center",
  },
  infoBar: {
    display:      "flex",
    gap:          8,
    flexWrap:     "wrap",
    marginBottom: 10,
  },
  infoText: {
    background:   "#d6eadf",
    color:        "#0f5d3b",
    borderRadius: 8,
    padding:      "4px 10px",
    fontSize:     11,
    fontWeight:   "700",
  },
  saveAllBtn: {
    background:   "#0f5d3b",
    color:        "#fff",
    border:       "none",
    borderRadius: 10,
    padding:      "11px",
    fontSize:     13,
    fontWeight:   "700",
    cursor:       "pointer",
    width:        "100%",
    marginBottom: 10,
  },
  emptyBox: {
    background:   "#fff",
    borderRadius: 12,
    padding:      24,
    textAlign:    "center",
  },
  teacherCard: {
    display:      "flex",
    alignItems:   "flex-start",
    gap:          12,
    padding:      14,
    borderRadius: 12,
    marginBottom: 10,
    boxShadow:    "0 2px 6px rgba(0,0,0,0.05)",
  },
  avatar: {
    width:        44,
    height:       44,
    borderRadius: "50%",
    objectFit:    "cover",
    flexShrink:   0,
    marginTop:    2,
  },
  avatarFallback: {
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
    marginTop:      2,
  },
  teacherName: {
    fontWeight:   "700",
    color:        "#0f5d3b",
    fontSize:     14,
    marginBottom: 2,
  },
  teacherSub: {
    fontSize:     11,
    color:        "#888",
    marginBottom: 8,
  },
  timeRow: {
    display:  "flex",
    gap:      8,
    flexWrap: "wrap",
  },
  timeField: {
    display:       "flex",
    flexDirection: "column",
    gap:           3,
    flex:          1,
    minWidth:      80,
  },
  timeLabel: {
    fontSize:   10,
    fontWeight: "700",
    color:      "#666",
  },
  timeInput: {
    padding:      "7px 8px",
    borderRadius: 8,
    border:       "1.5px solid #c8ddd2",
    fontSize:     12,
    color:        "#333",
    outline:      "none",
    width:        "100%",
    boxSizing:    "border-box",
  },
  statusSelect: {
    padding:      "7px 8px",
    borderRadius: 8,
    border:       "1.5px solid #c8ddd2",
    fontSize:     12,
    color:        "#333",
    outline:      "none",
    width:        "100%",
    background:   "#fff",
    boxSizing:    "border-box",
  },
  entryError: {
    color:     "#c62828",
    fontSize:  11,
    margin:    "4px 0 0",
  },
  savedText: {
    color:      "#2e7d32",
    fontSize:   11,
    margin:     "4px 0 0",
    fontWeight: "600",
  },
  saveBtn: {
    background:   "#0f5d3b",
    color:        "#fff",
    border:       "none",
    borderRadius: 8,
    padding:      "8px 14px",
    fontSize:     12,
    fontWeight:   "700",
    cursor:       "pointer",
    flexShrink:   0,
    alignSelf:    "center",
  },
  savedBadge: {
    background:   "#e8f5e9",
    color:        "#2e7d32",
    border:       "1px solid #4CAF50",
    borderRadius: 8,
    padding:      "6px 10px",
    fontSize:     14,
    fontWeight:   "700",
    flexShrink:   0,
    alignSelf:    "center",
  },
};