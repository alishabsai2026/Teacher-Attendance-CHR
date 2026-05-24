import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/guardDashboard.css";
import logo from "../assets/LOGO.png";

const GuardDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { name } = location.state || {};

  return (
    <>
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <h2>Welcome {name || "Guard"}</h2>
          <div className="dashboard-logo">
            <img src={logo} alt="Logo" />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="main">
        <div className="card-grid">

          {/* Slot Overview */}
          <div className="card" onClick={() => navigate("/slot-overview")}>
            <p>Slot Overview</p>
          </div>

          {/* Backdated Entry */}
          <div className="card" onClick={() => navigate("/backdated-entry")}>
            <p>Manual In/Out</p>
          </div>

          {/* Settings */}
          <div
            className="card"
            onClick={() => navigate("/settings", { state: { role: "guard" } })}
          >
            <p>Settings</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default GuardDashboard;