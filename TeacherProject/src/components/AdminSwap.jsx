import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/adminSwap.css";

export default function AdminSwap() {
  const location = useLocation();
  const admin_id = location.state?.admin_id || localStorage.getItem("admin_id");

  const API  = "http://192.168.100.92:5001";
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const [teachers, setTeachers]               = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedDay, setSelectedDay]         = useState("Mon");
  const [classes, setClasses]                 = useState([]);
  const [freeTeachers, setFreeTeachers]       = useState([]);
  const [selectedClass, setSelectedClass]     = useState(null);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingClasses, setLoadingClasses]   = useState(false);
  const [loadingFree, setLoadingFree]         = useState(false);

  // ================= DATE HELPER =================
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  // ================= STEP 1: ALL TEACHERS =================
  useEffect(() => { fetchAllTeachers() }, [])

  const fetchAllTeachers = async () => {
    setLoadingTeachers(true)
    try {
      const res  = await fetch(`${API}/api/all-teachers`)
      const data = await res.json()
      if (data.success) setTeachers(data.teachers)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoadingTeachers(false)
    }
  }

  // ================= STEP 2: TIMETABLE =================
  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher)
    setSelectedClass(null)
    setFreeTeachers([])
    setSelectedDay("Mon")
    fetchTimetable(teacher.teacher_id, "Mon")
  }

  const fetchTimetable = async (teacher_id, day) => {
    setLoadingClasses(true)
    setClasses([])
    try {
      const today = getTodayDate()
      const res = await fetch(
        `${API}/api/timetable` +
        `?teacher_id=${teacher_id}` +
        `&day=${day}` +
        `&selected_date=${today}`
      )
      const data = await res.json()
      if (data.success) {
        setClasses(data.classes)
        setSelectedClass(null)
        setFreeTeachers([])
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setLoadingClasses(false)
    }
  }

  const handleDayChange = (day) => {
    setSelectedDay(day)
    setSelectedClass(null)
    setFreeTeachers([])
    if (selectedTeacher) fetchTimetable(selectedTeacher.teacher_id, day)
  }

  // ================= STEP 3: FREE TEACHERS =================
  const handleSwapClick = async (cls) => {
    setSelectedClass(cls)
    setFreeTeachers([])
    setLoadingFree(true)

    try {
      const res = await fetch(
        `${API}/api/free-teachers` +
        `?day=${selectedDay}` +
        `&slot=${encodeURIComponent(cls.slot)}` +
        `&teacher_id=${selectedTeacher.teacher_id}` +
        `&section_id=${cls.section_id}`
      )
      const data = await res.json()
      if (data.success) setFreeTeachers(data.teachers)
      else alert("No free teachers found")
    } catch (err) {
      alert(err.message)
    } finally {
      setLoadingFree(false)
    }
  }

  // ================= STEP 4: ADMIN SWAP (aaj ki date automatic) =================
  const handleAdminSwap = async (freeTeacher) => {
    if (!selectedClass || !selectedTeacher) return

    const confirmed = window.confirm(
      `Swap "${selectedTeacher.name}" with "${freeTeacher.name}"?`
    )
    if (!confirmed) return

    const today = getTodayDate()

    try {
      const res = await fetch(`${API}/api/admin/swap`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_id:           admin_id,
          tid1:               selectedTeacher.teacher_id,
          tid2:               freeTeacher.teacher_id,
          timetable_id_1:     selectedClass.timetable_id,
          timetable_id_2:     freeTeacher.receiver_timetable_id,
          sender_swap_date:   today,
          receiver_swap_date: today,
        }),
      })

      const data = await res.json()

      if (data.status) {
        alert("✅ Admin Swap Completed")
        setFreeTeachers([])
        setSelectedClass(null)
        fetchTimetable(selectedTeacher.teacher_id, selectedDay)
      } else {
        alert("❌ " + data.message)
      }
    } catch (err) {
      alert(err.message)
    }
  }

  // ================= UI =================
  return (
    <div className="admin-swap-container">

      {/* SCREEN 1: ALL TEACHERS */}
      {!selectedTeacher && (
        <>
          <h2>All Teachers</h2>
          {loadingTeachers ? (
            <p className="no-data">Loading teachers...</p>
          ) : (
            <div
              className="teacher-list"
              style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "4px" }}
            >
              {teachers.map((t) => (
                <div
                  key={t.teacher_id}
                  className="teacher-card"
                  onClick={() => handleTeacherSelect(t)}
                >
                  {t.name}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* SCREEN 2 & 3: TIMETABLE + FREE TEACHERS */}
      {selectedTeacher && (
        <>
          <button
            className="back-btn"
            onClick={() => {
              setSelectedTeacher(null)
              setClasses([])
              setFreeTeachers([])
              setSelectedClass(null)
            }}
          >
            ← Back
          </button>

          <h2>{selectedTeacher.name}</h2>

          {/* Day Selector */}
          <div className="day-row">
            {days.map((d) => (
              <button
                key={d}
                className={selectedDay === d ? "day-btn active" : "day-btn"}
                onClick={() => handleDayChange(d)}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Timetable Cards */}
          {loadingClasses ? (
            <p className="no-data">Loading classes...</p>
          ) : (
            <div className="class-list">
              {classes.length === 0 && (
                <p className="no-data">No classes on {selectedDay}</p>
              )}
              {classes.map((cls) => (
                <div
                  key={cls.timetable_id}
                  className={`class-card ${selectedClass?.timetable_id === cls.timetable_id ? "selected" : ""}`}
                >
                  <div className="class-meta">
                    <div className="class-meta-item">
                      <span className="class-meta-label">Course</span>
                      <span className="class-meta-value">{cls.course}</span>
                    </div>
                    <div className="class-meta-item">
                      <span className="class-meta-label">Section</span>
                      <span className="class-meta-value">{cls.section_name || cls.section_id}</span>
                    </div>
                    <div className="class-meta-item">
                      <span className="class-meta-label">Slot</span>
                      <span className="class-meta-value">{cls.slot}</span>
                    </div>
                    <div className="class-meta-item">
                      <span className="class-meta-label">Venue</span>
                      <span className="class-meta-value">{cls.venue}</span>
                    </div>
                    {cls.is_swapped && (
                      <div className="class-meta-item">
                        <span style={{
                          backgroundColor: "#f0a500",
                          color:           "#fff",
                          fontSize:        11,
                          padding:         "2px 8px",
                          borderRadius:    4,
                          fontWeight:      "bold",
                        }}>
                          🔁 Swapped — {cls.swap_date}
                        </span>
                      </div>
                    )}
                  </div>
                  {!cls.is_swapped && (
                    <button
                      className="swap-btn"
                      onClick={() => handleSwapClick(cls)}
                    >
                      Swap
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Free Teachers */}
          {selectedClass && (
            <div className="free-teachers-section">
              <h3>
                Free Teachers for{" "}
                <span style={{ color: "#4f8ef7" }}>{selectedClass.slot}</span>
              </h3>

              {loadingFree ? (
                <p className="no-data">Loading free teachers...</p>
              ) : freeTeachers.length === 0 ? (
                <p className="no-data">No free teachers found for this slot</p>
              ) : (
                freeTeachers.map((t) => (
                  <div key={t.teacher_id} className="free-teacher-card">
                    <div>
                      <p style={{ margin: 0, fontWeight: "600", fontSize: 14 }}>{t.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#888" }}>
                        Their slot: {t.receiver_day} — {t.receiver_slot}
                      </p>
                    </div>
                    <button
                      className="swap-btn-small"
                      onClick={() => handleAdminSwap(t)}
                    >
                      Swap
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

    </div>
  )
}