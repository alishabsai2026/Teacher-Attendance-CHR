import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaCog, FaExchangeAlt, FaUmbrellaBeach } from "react-icons/fa";
import logo from "../assets/LOGO.png";
import "../styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const teacherName = location.state?.name || localStorage.getItem("teacher_name") || "User";
  const teacherId = location.state?.teacher_id || localStorage.getItem("teacher_id");

  // ✅ LocalStorage mein save karo
  useEffect(() => {
    if (location.state?.teacher_id) {
      localStorage.setItem("teacher_id", location.state.teacher_id);
      localStorage.setItem("teacher_name", location.state.name || "");
    }
  }, [location.state]);

  return (
    <>
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h2>Welcome {teacherName}</h2>
          <div className="dashboard-logo">
            <img src={logo} alt="BIIT Logo" />
          </div>
        </div>
      </div>

      <div className="main">
        <div className="card-grid">

          <div className="card" onClick={() => navigate("/timetable", { state: { teacher_id: teacherId } })}>
            <FaCalendarAlt />
            <p>Timetable</p>
          </div>

          <div className="card" onClick={() => navigate("/arrival-info", { state: { teacher_id: teacherId, name: teacherName } })}>
            <FaMapMarkerAlt />
            <p>Arrival Info</p>
          </div>

          <div className="card" onClick={() => navigate("/chr-details/47", { state: { teacher_id: teacherId } })}>
            <FaClock />
            <p>CHR DETAILS</p>
          </div>

          <div className="card" onClick={() => navigate("/swap", { state: { teacher_id: teacherId } })}>
            <FaExchangeAlt />
            <p>Swap</p>
          </div>

          <div className="card" onClick={() => navigate("/leave", { state: { teacher_id: teacherId, name: teacherName } })}>
            <FaUmbrellaBeach />
            <p>Leave</p>
          </div>

          <div className="card" onClick={() => navigate("/settings", { state: { role: "Teacher", teacher_id: teacherId } })}>
            <FaCog />
            <p>Settings</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;