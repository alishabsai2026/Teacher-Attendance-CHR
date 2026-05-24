import React, { useEffect, useState } from "react";
import "../styles/chrReport.css";

const API_BASE = "http://192.168.100.92:5000";

const formatDate = (d) => {
  if (typeof d === "string") return d;
  return d.toISOString().split("T")[0];
};

const SLOT_ORDER = [
  "8:30", "9:30", "10:30", "11:30", "12:30",
  "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00"
];

const getSlotStartKey = (slot) => {
  if (!slot) return 99;
  const clean = slot.replace(/\s/g, "");
  const idx = SLOT_ORDER.findIndex((o) =>
    clean.startsWith(o.replace(/\s/g, ""))
  );
  return idx === -1 ? 99 : idx;
};

const getBadge = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "not held") return { cls: "chr-badge-notheld", label: "Not Held" };
  if (s === "late")     return { cls: "chr-badge-late",    label: "Late"     };
  if (s === "swapped")  return { cls: "chr-badge-swapped", label: "Swapped"  };
  return                       { cls: "chr-badge-held",    label: "Held"     };
};

// 00:00:00 ko — show karo
const formatTime = (t) => {
  if (!t) return "—";
  if (t === "00:00:00") return "—";
  return t;
};

export default function CHRReport() {
  const [date, setDate]       = useState(formatDate(new Date()));
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError]     = useState(null);

  const fetchCHR = async (selectedDate) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/chr/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json.complete_chr);
      } else {
        setData([]);
        setError(json.error || "Data load nahi hua");
      }
    } catch (err) {
      console.error("API ERROR =>", err);
      setData([]);
      setError("Server connection lost");
    }
    setLoading(false);
    setFetched(true);
  };

  useEffect(() => { fetchCHR(date); }, []);

  const onChangeDate = (e) => {
    const val = e.target.value;
    setDate(val);
    fetchCHR(val);
  };

  const grouped = {};
  data.forEach((r) => {
    const key = r.slot || "Unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  const sortedSlots = Object.keys(grouped).sort(
    (a, b) => getSlotStartKey(a) - getSlotStartKey(b)
  );

  const totalCount   = data.length;
  const heldCount    = data.filter((d) => d.status?.toLowerCase() === "held").length;
  const lateCount    = data.filter((d) => d.status?.toLowerCase() === "late").length;
  const notHeldCount = data.filter((d) => d.status?.toLowerCase() === "not held").length;
  const swappedCount = data.filter((d) => d.status?.toLowerCase() === "swapped").length;

  let srCounter = 1;

  return (
    <div className="chr-wrapper">

      {/* HEADER */}
      <div className="chr-header">
        <div className="chr-header-content">
          <h2>CHR Report</h2>
          <input
            type="date"
            className="chr-date-input-header"
            value={date}
            onChange={onChangeDate}
          />
        </div>
      </div>

      <div className="chr-body">
        <div className="chr-container">

          {/* Summary Bar */}
          {!loading && fetched && totalCount > 0 && (
            <div className="chr-summary">
              <div className="chr-summary-item chr-summary-total">
                <span className="chr-summary-count">{totalCount}</span>
                <span className="chr-summary-label">Total Classes</span>
              </div>
              <div className="chr-summary-item chr-summary-held">
                <span className="chr-summary-count">{heldCount}</span>
                <span className="chr-summary-label">Held</span>
              </div>
              <div className="chr-summary-item chr-summary-late">
                <span className="chr-summary-count">{lateCount}</span>
                <span className="chr-summary-label">Late</span>
              </div>
              <div className="chr-summary-item chr-summary-notheld">
                <span className="chr-summary-count">{notHeldCount}</span>
                <span className="chr-summary-label">Not Held</span>
              </div>
              {swappedCount > 0 && (
                <div className="chr-summary-item chr-summary-swapped">
                  <span className="chr-summary-count">{swappedCount}</span>
                  <span className="chr-summary-label">Swapped</span>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && <div className="chr-error">{error}</div>}

          {/* Loading */}
          {loading && (
            <div className="chr-loading">
              <div className="chr-spinner" />
              <p>Loading CHR data...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && fetched && totalCount === 0 && !error && (
            <p className="chr-empty">No record found for this date.</p>
          )}

          {/* TABLE */}
          {!loading && totalCount > 0 && (
            <div className="chr-table-wrapper">
              <table className="chr-table">
                <thead>
                  <tr>
                    <th>Sr#</th>
                    <th>Teacher</th>
                    <th>Section</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Duration</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSlots.map((slot) => (
                    <React.Fragment key={slot}>
                      <tr className="chr-slot-row">
                        <td colSpan={9}>{slot}</td>
                      </tr>
                      {grouped[slot].map((item, idx) => {
                        const s         = (item.status || "").toLowerCase();
                        const isLate    = s === "late";
                        const isNotHeld = s === "not held";
                        const badge     = getBadge(item.status);

                        let rowClass = idx % 2 === 0 ? "chr-row-even" : "chr-row-odd";
                        if (isNotHeld) rowClass = "chr-row-notheld";
                        if (isLate)    rowClass = "chr-row-late";

                        return (
                          <tr
                            key={item.timetable_id ?? idx}
                            className={`chr-data-row ${rowClass}`}
                          >
                            <td className="chr-td-sr">{srCounter++}</td>
                            <td className="chr-td-name">{item.full_name}</td>
                            <td>{item.section_id ?? "—"}</td>
                            <td>{item.venue ?? "—"}</td>
                            <td>
                              <span className={`chr-badge ${badge.cls}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className={`chr-td-mono ${isLate ? "chr-time-late" : ""}`}>
                              {formatTime(item.time_in)}
                            </td>
                            <td className="chr-td-mono">
                              {formatTime(item.time_out)}
                            </td>
                            <td>{isNotHeld ? "—" : (item.duration ?? "—")}</td>
                            <td className="chr-td-comments">
                              {item.comments ?? "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}