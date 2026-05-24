import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/InOutStatus.css";

export default function InOutStatus() {
  const location = useLocation();
  const navigate = useNavigate();

  // receive teacher + slot info from previous screen
  const teacher = location.state?.teacher;
  const day = location.state?.day;
  const slot = location.state?.slot;

  const [loading, setLoading] = useState(true);
  const [chrId, setChrId] = useState(null);
  const [timeIn, setTimeIn] = useState(null);
  const [timeOut, setTimeOut] = useState(null);

  // ================= FETCH STATUS =================
  useEffect(() => {
    if (!teacher) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch("http://192.168.100.92:8000/chr/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teacher_id: teacher.teacher_id,
            slot: slot,
            day: day,
            section_id: teacher.section_id,
            venue: teacher.venue,
          }),
        });

        const data = await res.json();

        setChrId(data.chr_id);
        setTimeIn(data.time_in);
        setTimeOut(data.time_out);
      } catch (err) {
        console.log("Status fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [teacher, day, slot]);

  // ================= TIME IN =================
  const handleTimeIn = async () => {
    try {
      const res = await fetch("http://192.168.100.92:8000/chr/time_in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: teacher.teacher_id,
          slot: slot,
          day: day,
          section_id: teacher.section_id,
          venue: teacher.venue,
        }),
      });

      const data = await res.json();

      setTimeIn(data.time_in);
      setChrId(data.chr_id);
    } catch (err) {
      console.log("Time in error", err);
    }
  };

  // ================= TIME OUT =================
  const handleTimeOut = async () => {
    try {
      const res = await fetch("http://192.168.100.92:8000/chr/time_out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chr_id: chrId }),
      });

      const data = await res.json();
      setTimeOut(data.time_out);
    } catch (err) {
      console.log("Time out error", err);
    }
  };

  // ================= DURATION =================
  const getDuration = () => {
    if (!timeIn || !timeOut) return null;

    const t1 = new Date(`1970-01-01T${timeIn}`);
    const t2 = new Date(`1970-01-01T${timeOut}`);

    const diff = Math.floor((t2 - t1) / 60000);
    return `${diff} minutes`;
  };

  if (!teacher) {
    return <div className="status-container">No teacher selected</div>;
  }

  if (loading) {
    return <div className="status-container">Loading...</div>;
  }

  return (
    <div className="status-container">
      <h2>Class Status</h2>

      <div className="teacher-card">
        <h3>{teacher.full_name}</h3>
        <p>{day} — {slot}</p>
        <p>{teacher.venue} • {teacher.section_name}</p>
      </div>

      {/* BUTTON LOGIC */}
      {!timeIn && (
        <button className="btn timein" onClick={handleTimeIn}>
          TIME IN
        </button>
      )}

      {timeIn && !timeOut && (
        <button className="btn timeout" onClick={handleTimeOut}>
          TIME OUT
        </button>
      )}

      {/* STATUS DISPLAY */}
      <div className="time-info">
        {timeIn && <p>Time In: {timeIn}</p>}
        {timeOut && <p>Time Out: {timeOut}</p>}
        {timeOut && <p>Duration: {getDuration()}</p>}
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
}