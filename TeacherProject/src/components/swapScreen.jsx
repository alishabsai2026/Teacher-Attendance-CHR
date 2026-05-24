import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/swap.css";

const SwapScreen = () => {
  const location = useLocation();

  const teacher_id =
    location.state?.teacher_id ||
    localStorage.getItem("teacher_id");

  const API_URL = "http://192.168.100.92:17000";

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const [selectedDay, setSelectedDay]     = useState("Mon");
  const [classes, setClasses]             = useState([]);
  const [freeTeachers, setFreeTeachers]   = useState([]);
  const [incoming, setIncoming]           = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalVisible, setModalVisible]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [requestSent, setRequestSent]     = useState(false);

  // ================= DATE HELPER =================
  const getNextDateForDay = (dayShort) => {
    const dayMap  = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5 };
    const fullMap = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 };

    const target  = dayMap[dayShort] || fullMap[dayShort];
    const today   = new Date();
    const current = today.getDay();

    let diff = target - current;
    if (diff <= 0) diff += 7;

    const result = new Date(today);
    result.setDate(today.getDate() + diff);

    return result.toISOString().split("T")[0];
  };

  // ================= TIMETABLE =================
  const fetchTimetable = async (day) => {
    try {
      const res  = await fetch(`${API_URL}/api/timetable?teacher_id=${teacher_id}&day=${day}`);
      const data = await res.json();
      if (data.success) setClasses(Array.isArray(data.classes) ? data.classes : []);
      else setClasses([]);
    } catch (err) {
      console.log("Timetable error:", err);
      setClasses([]);
    }
  };

  // ================= FREE TEACHERS =================
  const fetchFreeTeachers = async (cls) => {
    if (!cls.section_id || !cls.slot || !selectedDay) {
      alert("Class data incomplete.");
      return;
    }

    setSelectedClass(cls);
    setFreeTeachers([]);
    setRequestSent(false);
    setLoading(true);

    try {
      const res  = await fetch(
        `${API_URL}/api/free-teachers` +
        `?section_id=${cls.section_id}` +
        `&day=${selectedDay}` +
        `&slot=${encodeURIComponent(cls.slot)}` +
        `&teacher_id=${teacher_id}`
      );
      const data = await res.json();

      if (data.success) setFreeTeachers(Array.isArray(data.teachers) ? data.teachers : []);
      else { setFreeTeachers([]); alert(data.message || "No teachers found"); }

      setModalVisible(true);
    } catch (err) {
      alert("Could not load free teachers.");
    } finally {
      setLoading(false);
    }
  };

  // ================= AUTO REQUEST =================
  const startAutoRequest = async () => {
    if (!selectedClass || freeTeachers.length === 0) return;

    setLoading(true);

    try {
      const teacherList      = freeTeachers.map((t) => t.teacher_id);
      const senderSwapDate   = getNextDateForDay(selectedDay);
      const receiverSwapDate = getNextDateForDay(freeTeachers[0].receiver_day);

      const payload = {
        req_id:                teacher_id,
        teacher_list:          teacherList,
        timetable_id:          selectedClass.timetable_id,
        receiver_timetable_id: freeTeachers[0].receiver_timetable_id,
        sender_swap_date:      senderSwapDate,
        receiver_swap_date:    receiverSwapDate,
      };

      const res  = await fetch(`${API_URL}/api/start-auto-request`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) setRequestSent(true);
      else alert(data.message || "Something went wrong.");
    } catch (err) {
      alert("Request failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  // ================= INCOMING =================
  const fetchIncoming = async () => {
    try {
      const res  = await fetch(`${API_URL}/api/incoming-requests?teacher_id=${teacher_id}`);
      const data = await res.json();
      setIncoming(Array.isArray(data.requests) ? data.requests : []);
    } catch (err) {
      console.log("Incoming error:", err);
    }
  };

  // ================= RESPOND =================
  const respondRequest = async (id, action) => {
    try {
      const res  = await fetch(`${API_URL}/api/respond-request`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ request_id: id, action }),
      });
      const data = await res.json();
      console.log("RESPOND:", data);
      fetchIncoming();
      fetchTimetable(selectedDay);
    } catch (err) {
      console.log("Respond error:", err);
    }
  };

  // ================= LOAD =================
  useEffect(() => {
    if (teacher_id) {
      fetchTimetable(selectedDay);
      fetchIncoming();
    }
  }, [teacher_id, selectedDay]);

  // ================= POLLING =================
  useEffect(() => {
    const interval = setInterval(() => {
      if (teacher_id) fetchIncoming();
    }, 30000);
    return () => clearInterval(interval);
  }, [teacher_id]);

  // ================= incoming ko 2 hisson mein todo =================
  const pendingRequests   = incoming.filter((r) => r.status === "pending");
  const adminSwapRequests = incoming.filter((r) => r.status === "admin_swap");

  // ================= UI =================
  return (
    <div className="swap-container">

      <h2>My Timetable</h2>

      {/* DAY BUTTONS */}
      <div className="day-row">
        {days.map((d) => (
          <button
            key={d}
            className={`day-btn ${selectedDay === d ? "active" : ""}`}
            onClick={() => setSelectedDay(d)}
          >
            {d}
          </button>
        ))}
      </div>

      {/* TIMETABLE */}
      <div className="class-list">
        {classes.length === 0 ? (
          <p style={{ color: "#888", fontSize: 13 }}>No classes for {selectedDay}</p>
        ) : (
          classes.map((item, index) => (
            <div className="card" key={item.timetable_id || index}>
              <div className="card-info">
                <p><span>Course:</span> {item.course || "-"}</p>
                <p><span>Section:</span> {item.section || item.section_name || "-"}</p>
                <p><span>Slot:</span> {item.slot || "-"}</p>
                <p><span>Venue:</span> {item.venue || "-"}</p>
                {item.is_swapped && (
                  <p style={{
                    marginTop: 6,
                    display: "inline-block",
                    backgroundColor: "#f0a500",
                    color: "#fff",
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontWeight: "bold",
                  }}>
                    🔁 Swapped — {item.swap_date}
                  </p>
                )}
              </div>
              {!item.is_swapped && (
                <button className="swap-btn" onClick={() => fetchFreeTeachers(item)}>
                  Swap
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* ✅ ADMIN SWAP NOTIFICATIONS — sirf dikhao, koi button nahi */}
      {adminSwapRequests.length > 0 && (
        <>
          <h2 style={{ marginTop: 24, marginBottom: 10 }}>🔔 Admin Swap Notifications</h2>
          <div className="class-list">
            {adminSwapRequests.map((req) => (
              <div
                className="card"
                key={req.id}
                style={{ borderLeft: "4px solid #f0a500" }}
              >
                <div className="card-info">
                  {/* Admin ne swap kiya — "From" nahi dikhana, Admin dikhao */}
                  <p style={{
                    backgroundColor: "#fff3cd",
                    color: "#856404",
                    fontSize: 12,
                    padding: "3px 8px",
                    borderRadius: 4,
                    display: "inline-block",
                    marginBottom: 6,
                    fontWeight: "bold",
                  }}>
                    ⚠️ Swapped by Admin
                  </p>
                  <p><span>Your Slot:</span> {req.slot}</p>
                  <p><span>Course:</span> {req.course}</p>
                  {req.sender_swap_date && (
                    <p><span>Class Date:</span> {req.sender_swap_date}</p>
                  )}
                  {req.receiver_swap_date && (
                    <p><span>Other Class Date:</span> {req.receiver_swap_date}</p>
                  )}
                </div>
                {/* ✅ Koi Accept/Decline button nahi — sirf notification */}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ✅ NORMAL INCOMING REQUESTS — Accept/Decline wale */}
      {pendingRequests.length > 0 && (
        <>
          <h2 style={{ marginTop: 24, marginBottom: 10 }}>📥 Incoming Requests</h2>
          <div className="class-list">
            {pendingRequests.map((req) => (
              <div className="card" key={req.id}>
                <div className="card-info">
                  <p><span>From:</span> {req.sender_name}</p>
                  <p><span>Course:</span> {req.course}</p>
                  <p><span>Their Slot:</span> {req.slot}</p>
                  {req.sender_swap_date && (
                    <p><span>Their Class Date:</span> {req.sender_swap_date}</p>
                  )}
                  {req.receiver_swap_date && (
                    <p><span>Your Class Date:</span> {req.receiver_swap_date}</p>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button className="swap-btn"  onClick={() => respondRequest(req.id, "accept")}>
                    Accept
                  </button>
                  <button className="close-btn" onClick={() => respondRequest(req.id, "decline")}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Free Teachers</h3>

            {selectedClass && (
              <div style={{
                backgroundColor: "#f5f5f5",
                borderRadius: 6,
                padding: "8px 12px",
                marginBottom: 12,
                fontSize: 13,
              }}>
                <p style={{ margin: 0 }}><strong>Your Slot:</strong> {selectedClass.slot}</p>
                <p style={{ margin: "4px 0 0" }}><strong>Course:</strong> {selectedClass.course}</p>
                <p style={{ margin: "4px 0 0" }}><strong>Swap Date:</strong> {getNextDateForDay(selectedDay)}</p>
              </div>
            )}

            {freeTeachers.length === 0 ? (
              <p style={{ fontSize: 13, color: "#888", margin: "12px 0" }}>
                No free teachers found for this slot.
              </p>
            ) : (
              <div style={{ marginBottom: 16 }}>
                {freeTeachers.map((t, index) => (
                  <div
                    key={t.teacher_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <div style={{
                      width: 26, height: 26,
                      borderRadius: "50%",
                      backgroundColor: index === 0 ? "#1a1a2e" : "#ddd",
                      color: index === 0 ? "#fff" : "#555",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: "600" }}>{t.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#888" }}>
                        Their slot: {t.receiver_day} — {t.receiver_slot}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#888" }}>
                        They take your class on: {getNextDateForDay(t.receiver_day)}
                      </p>
                    </div>
                    {index === 0 && (
                      <span style={{
                        fontSize: 11,
                        backgroundColor: "#f0a500",
                        color: "#fff",
                        padding: "2px 7px",
                        borderRadius: 4,
                        flexShrink: 0,
                      }}>
                        First
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {requestSent ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <p style={{ fontSize: 22 }}>✅</p>
                <p style={{ fontSize: 14, color: "#333", margin: "6px 0 14px" }}>
                  Request sent! Waiting for response.
                </p>
                <button
                  className="close-btn"
                  onClick={() => { setModalVisible(false); setRequestSent(false); }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {freeTeachers.length > 0 && (
                  <button
                    className="swap-btn"
                    style={{ width: "100%", maxWidth: "none", marginBottom: 10, opacity: loading ? 0.7 : 1 }}
                    onClick={startAutoRequest}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Auto Request"}
                  </button>
                )}
                <button className="close-btn" onClick={() => setModalVisible(false)}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapScreen;