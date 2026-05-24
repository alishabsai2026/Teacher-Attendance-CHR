import React from "react";
import"../styles/Settings.css";

export default function Settings({ role, onLogout }) {
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout && onLogout) {
      onLogout(); // call parent logout function
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-header">Settings {role ? `(${role})` : ""}</h2>

      <div className="settings-option">
        <p className="settings-text">Notifications</p>
      </div>

      <div
        className="settings-option"
        style={{ marginTop: "20px" }}
        onClick={handleLogout}
      >
        <p className="settings-text logout-text">Logout</p>
      </div>
    </div>
  );
}