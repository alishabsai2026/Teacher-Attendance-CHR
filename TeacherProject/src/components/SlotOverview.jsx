import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SlotOverview() {
  const navigate = useNavigate();

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const slots = [
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

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedFloors, setSelectedFloors] = useState({});

  // mode = "timein" | "timeout"
  const handleSlotClick = (slot, mode) => {
    const floorId = selectedFloors[slot];
    if (!floorId) {
      alert("Please select a floor first");
      return;
    }
    navigate("/slot-teachers", {
      state: { day: selectedDay, slot, floor_id: floorId, mode },
    });
  };

  const styles = {
    container: {
      minHeight: "100vh",
      padding: "20px 16px",
      backgroundColor: "#eef3f0",
      fontFamily: "Segoe UI, sans-serif",
    },
    heading: {
      fontSize: 20,
      fontWeight: "600",
      color: "#0f5d3b",
      marginBottom: 15,
    },
    dayContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))",
      gap: 10,
    },
    dayCard: {
      padding: "10px 0",
      borderRadius: 10,
      border: "none",
      background: "#d6eadf",
      color: "#0f5d3b",
      fontWeight: "600",
      cursor: "pointer",
      transition: "0.2s",
      fontSize: 14,
    },
    activeDay: {
      background: "#0f5d3b",
      color: "#fff",
    },
    slotWrapper: {
      marginTop: 20,
    },
    slotHeading: {
      fontSize: 16,
      fontWeight: "600",
      color: "#0f5d3b",
      marginBottom: 10,
    },
    slotGrid: {
      display: "grid",
      gap: 10,
    },
    slotRow: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    slotLabel: {
      flex: 1,
      background: "#fff",
      padding: "12px 14px",
      borderRadius: 12,
      border: "1px solid #e0e0e0",
      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
      fontSize: 13,
      fontWeight: "700",
      color: "#0f5d3b",
      minWidth: 0,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    dropdown: {
      padding: "10px 8px",
      borderRadius: 10,
      border: "1px solid #c8ddd2",
      background: "#fff",
      color: "#0f5d3b",
      fontSize: 12,
      fontWeight: "600",
      cursor: "pointer",
      outline: "none",
      minWidth: 95,
      flexShrink: 0,
    },
    btnGroup: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
      flexShrink: 0,
    },
    timeInBtn: {
      background: "#0f5d3b",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "7px 12px",
      fontSize: 12,
      fontWeight: "700",
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
    timeOutBtn: {
      background: "#fff",
      color: "#0f5d3b",
      border: "1.5px solid #0f5d3b",
      borderRadius: 8,
      padding: "7px 12px",
      fontSize: 12,
      fontWeight: "700",
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Select Day</h2>

      {/* DAYS */}
      <div style={styles.dayContainer}>
        {days.map((day) => (
          <button
            key={day}
            style={{
              ...styles.dayCard,
              ...(selectedDay === day ? styles.activeDay : {}),
            }}
            onClick={() => {
              setSelectedDay(day);
              setSelectedFloors({});
            }}
          >
            {day}
          </button>
        ))}
      </div>

      {/* SLOTS */}
      {selectedDay && (
        <div style={styles.slotWrapper}>
          <h3 style={styles.slotHeading}>Slots for {selectedDay}</h3>

          <div style={styles.slotGrid}>
            {slots.map((slot) => (
              <div key={slot} style={styles.slotRow}>

                {/* SLOT LABEL */}
                <div style={styles.slotLabel}>{slot}</div>

                {/* FLOOR DROPDOWN */}
                <select
                  value={selectedFloors[slot] || ""}
                  onChange={(e) =>
                    setSelectedFloors((prev) => ({
                      ...prev,
                      [slot]: e.target.value ? parseInt(e.target.value) : "",
                    }))
                  }
                  style={styles.dropdown}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Floor</option>
                  {FLOORS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>

                {/* TIME IN / TIME OUT BUTTONS */}
                <div style={styles.btnGroup}>
                  <button
                    style={styles.timeInBtn}
                    onClick={() => handleSlotClick(slot, "timein")}
                  >
                    Time In
                  </button>
                  <button
                    style={styles.timeOutBtn}
                    onClick={() => handleSlotClick(slot, "timeout")}
                  >
                    Time Out
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}