import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/timetable.css";

const Timetable = () => {
  const location = useLocation();

  const teacher_id =
    location.state?.teacher_id || localStorage.getItem("teacher_id");

  const teacherName =
    location.state?.name || localStorage.getItem("teacher_name") || "User";

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Helpers
  const getDayShort = (dateStr) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date(dateStr).getDay()];
  };

  const getTodayShort = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date().getDay()];
  };

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  // ✅ Default = aaj ka din
  const [selectedDay, setSelectedDay] = useState(getTodayShort());
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  // API fetch
  const fetchTimetable = async (day) => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://192.168.100.92:9000/api/timetable?teacher_id=${teacher_id}&day=${day}`
      );
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes);
      } else {
        setClasses([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Page load pe aaj ka data aayega
  useEffect(() => {
    if (!teacher_id) return;
    fetchTimetable(getTodayShort());
  }, [teacher_id]);

  return (
    <>
      {/* HEADER */}
      <div className="timetable-header">
        <div className="timetable-header-content">
          <h2>{teacherName} — Timetable</h2>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="timetable-body">
        <div className="timetable-controls">

          {/* ✅ Datepicker — controlled + aaj ki date default */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              const day = getDayShort(e.target.value);
              setSelectedDate(e.target.value);
              setSelectedDay(day);
              fetchTimetable(day);
            }}
          />

          {/* ✅ Dropdown — datepicker se sync */}
          <select
            value={selectedDay}
            onChange={(e) => {
              setSelectedDay(e.target.value);
              setSelectedDate(""); // dropdown use ho to date clear
              fetchTimetable(e.target.value);
            }}
          >
            <option value="Mon">Monday</option>
            <option value="Tue">Tuesday</option>
            <option value="Wed">Wednesday</option>
            <option value="Thu">Thursday</option>
            <option value="Fri">Friday</option>
          </select>

        </div>
      </div>

      {/* CLASS LIST */}
      <div className="class-list-wrapper">
        {loading ? (
          <p>Loading...</p>
        ) : classes.length === 0 ? (
          <p>No Classes Found</p>
        ) : (
          classes.map((item, index) => (
            <div className="class-card" key={index}>
              <div className="class-left">
                <p className="class-section">
                  {item.section} | {item.venue}
                </p>
                <h3 className="class-subject">{item.course}</h3>
              </div>
              <div className="class-right">
                <div className="time-box">{item.slot}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TOTAL */}
      <div className="total-classes-card">
        <div>
          <p>Total Classes Today</p>
          <p>{classes.length} Classes</p>
        </div>
      </div>
    </>
  );
};

export default Timetable;