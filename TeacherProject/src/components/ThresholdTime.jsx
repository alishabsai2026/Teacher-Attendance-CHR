import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaClock, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
//import "./ThresholdTime.css";

const API_URL = "http://192.168.100.92:14000";

const ThresholdTime = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const admin_id  = location.state?.admin_id;

  const [time,        setTime]        = useState("");
  const [loading,     setLoading]     = useState(false);
  const [fetching,    setFetching]    = useState(true);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");

  // ================= GET CURRENT TIME =================
  const getTime = async () => {
    setFetching(true);
    try {
      const res  = await fetch(`${API_URL}/api/dynamic_time`);
      const data = await res.json();
      if (data.success && data.time !== null) {
        setTime(String(data.time));
      }
    } catch (e) {
      setError("Could not fetch current threshold.");
    } finally {
      setFetching(false);
    }
  };

  // ================= UPDATE TIME =================
  const updateTime = async () => {
    const parsed = parseInt(time);
    if (!time || isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid number greater than 0.");
      return;
    }

    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res  = await fetch(`${API_URL}/api/dynamic_set_time`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ time: parsed }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || "Update failed.");
      }
    } catch (e) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTime();
  }, []);

  return (
    <div className="threshold-page">

      {/* HEADER — same as admin dashboard */}
      <div className="admin-header">
        <div className="admin-header-content">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>
          <h2>THRESHOLD TIME</h2>
          <div></div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="threshold-main">
        <div className="threshold-card">

          {/* Icon + Title */}
          <div className="threshold-icon-wrap">
            <FaClock className="threshold-icon" />
          </div>

          <h3 className="threshold-title">Swap Request Timer</h3>
          <p className="threshold-desc">
            Set the number of minutes before a swap request
            automatically moves to the next teacher.
          </p>

          {/* Input */}
          {fetching ? (
            <div className="threshold-loading">
              <div className="spinner"></div>
              <span>Loading current value...</span>
            </div>
          ) : (
            <div className="threshold-input-wrap">
              <input
                type="number"
                className="threshold-input"
                placeholder="e.g. 15"
                value={time}
                min="1"
                onChange={(e) => {
                  setTime(e.target.value);
                  setError("");
                  setSuccess(false);
                }}
              />
              <span className="threshold-unit">min</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="threshold-error">
              ⚠️ {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="threshold-success">
              <FaCheckCircle /> Threshold updated successfully!
            </div>
          )}

          {/* Save Button */}
          <button
            className={`threshold-btn ${loading ? "loading" : ""}`}
            onClick={updateTime}
            disabled={loading || fetching}
          >
            {loading ? (
              <span className="btn-spinner"></span>
            ) : (
              "SAVE"
            )}
          </button>

          {/* Info box */}
          <div className="threshold-info-box">
            <p>📌 Current setting: <strong>{fetching ? "..." : `${time} minutes`}</strong></p>
            <p>If no teacher accepts within this time, the request moves to the next available teacher automatically.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ThresholdTime;