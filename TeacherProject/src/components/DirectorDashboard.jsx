import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChartBar, FaFileAlt, FaUsers, FaUserCheck, FaExclamationTriangle } from "react-icons/fa";
import logo from "../assets/LOGO.png";
import "../styles/directorDashboard.css";

const DirectorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const directorName = location.state?.name || "Director";

  return (
    <>
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h2>Welcome {directorName}</h2>
          <div className="dashboard-logo">
            <img src={logo} alt="BIIT Logo" />
          </div>
        </div>
      </div>

      <div className="main">
        <div className="director-card-grid">

          {/* Card 1: View Teachers Weekly Hours */}
          <div
            className="card director-card"
            onClick={() => navigate("/teachers-weekly-hours")}
          >
            <div className="card-icon-wrapper">
              <FaChartBar />
            </div>
            <p>View Teachers<br />Weekly Hours</p>
          </div>

          {/* Card 2: CHR Report */}
          <div
            className="card director-card"
            onClick={() => navigate("/chr-report")}
          >
            <div className="card-icon-wrapper">
              <FaFileAlt />
            </div>
            <p>CHR Report</p>
          </div>

          {/* Card 3: Overall Summary */}
          <div
            className="card director-card"
            onClick={() => navigate("/overall-summary")}
          >
            <div className="card-icon-wrapper">
              <FaUsers />
            </div>
            <p>Overall<br />Summary</p>
          </div>

          {/* Card 4: Today's Status */}
          <div
            className="card director-card"
            onClick={() => navigate("/today-status")}
          >
            <div className="card-icon-wrapper">
              <FaUserCheck />
            </div>
            <p>Today's<br />Status</p>
          </div>

          {/* Card 5: Weekly Low Hours */}
          <div
            className="card director-card"
            onClick={() => navigate("/weekly-low-hours")}
          >
            <div className="card-icon-wrapper card-icon-warning">
              <FaExclamationTriangle />
            </div>
            <p>Weekly Low<br />Hours</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default DirectorDashboard;