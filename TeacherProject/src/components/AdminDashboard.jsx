import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/LOGO.png";
import "../styles/adminDashboard.css";

import {
  FaDoorOpen,
  FaExchangeAlt,
  FaUmbrellaBeach,
  FaClipboardList,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const admin_id = location.state?.admin_id;

  return (
    <>
      {/* HEADER */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo">
            <img src={logo} alt="Logo" />
          </div>

          <h2>ADMIN DASHBOARD</h2>

          <div></div>
        </div>
      </div>

      {/* MAIN */}
      <div className="admin-main">
        <div className="admin-card-grid">

          {/* Gate Verification */}
          <div
            className="admin-card"
            onClick={() => navigate("/gate-verify", { state: { admin_id } })}
          >
            <FaDoorOpen />
            <p>GATE VERIFICATION</p>
          </div>

          {/* Swap Slots */}
          <div
            className="admin-card"
            onClick={() =>
              navigate("/admin-swap", {
                state: {
                  admin_id:
                    location.state?.admin_id ||
                    localStorage.getItem("admin_id"),
                },
              })
            }
          >
            <FaExchangeAlt />
            <p>SWAP SLOTS</p>
          </div>

          {/* On Leave Teachers */}
          <div
            className="admin-card"
            onClick={() => navigate("/on-leave", { state: { admin_id } })}
          >
            <FaUmbrellaBeach />
            <p>ON LEAVE</p>
          </div>

          {/* Manual Attendance */}
          <div
            className="admin-card"
            onClick={() => navigate("/manual-verify", { state: { admin_id } })}
          >
            <FaClipboardList />
            <p>MANUAL ATTENDANCE</p>
          </div>

          {/* Upload Timetable — TEMPORARILY HIDDEN */}
          {/* <div
            className="admin-card"
            onClick={() => navigate("/upload-timetable", { state: { admin_id } })}
          >
            <FaCalendarAlt />
            <p>UPLOAD TIMETABLE</p>
          </div> */}

          {/* Threshold Time */}
          <div
            className="admin-card"
            onClick={() => navigate("/threshold-time", { state: { admin_id } })}
          >
            <FaClock />
            <p>THRESHOLD TIME</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;