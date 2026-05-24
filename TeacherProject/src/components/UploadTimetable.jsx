import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { FaCloudUploadAlt, FaFileExcel, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaSpinner } from "react-icons/fa";


const styles = `
  .upload-container {
    max-width: 600px;
    margin: 40px auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 0 16px;
  }
  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: #555;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    width: fit-content;
    transition: color 0.2s;
  }
  .back-btn:hover { color: #222; }
  .drop-zone {
    border: 2px dashed #c0c0c0;
    border-radius: 14px;
    padding: 48px 24px;
    text-align: center;
    cursor: pointer;
    background: #fafafa;
    transition: border-color 0.2s, background 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .drop-zone:hover, .drop-zone.drag-active {
    border-color: #4a90e2;
    background: #f0f6ff;
  }
  .drop-zone.has-file {
    border-style: solid;
    border-color: #4a90e2;
    background: #f0f6ff;
    cursor: default;
    padding: 24px;
  }
  .upload-icon { font-size: 52px; color: #4a90e2; }
  .drop-title { font-size: 17px; font-weight: 700; color: #333; margin: 0; }
  .drop-sub { font-size: 13px; color: #888; margin: 0; }
  .file-badge {
    display: inline-block;
    background: #e8f0fe;
    color: #4a90e2;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
    margin-top: 4px;
  }
  .file-selected { display: flex; align-items: center; gap: 14px; width: 100%; }
  .excel-icon { font-size: 38px; color: #1d7a3f; flex-shrink: 0; }
  .file-info { flex: 1; text-align: left; }
  .file-name { font-size: 15px; font-weight: 700; color: #222; margin: 0; word-break: break-all; }
  .file-size { font-size: 12px; color: #888; margin: 2px 0 0; }
  .remove-btn {
    background: none; border: none; cursor: pointer;
    color: #cc3333; font-size: 22px; padding: 0; line-height: 1;
    transition: color 0.2s; flex-shrink: 0;
  }
  .remove-btn:hover { color: #991111; }
  .upload-btn {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    background: #4a90e2; color: #fff; border: none; border-radius: 10px;
    padding: 14px 0; font-size: 16px; font-weight: 700;
    cursor: pointer; width: 100%; transition: background 0.2s, transform 0.1s;
  }
  .upload-btn:hover:not(.disabled) { background: #2f74cc; transform: translateY(-1px); }
  .upload-btn.disabled { background: #b0c4de; cursor: not-allowed; transform: none; }
  .spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .result-card { border-radius: 12px; padding: 20px 24px; }
  .success-card { background: #f0fff4; border: 1.5px solid #48bb78; }
  .error-card {
    background: #fff5f5; border: 1.5px solid #fc8181;
    display: flex; align-items: center; gap: 12px;
    color: #c53030; font-size: 14px; font-weight: 600;
  }
  .result-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
  .result-header h3 { margin: 0; font-size: 15px; font-weight: 700; color: #276749; }
  .result-icon { font-size: 26px; flex-shrink: 0; }
  .success-icon { color: #38a169; }
  .error-icon { color: #e53e3e; }
  .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .summary-item {
    background: #fff; border-radius: 8px; padding: 12px;
    text-align: center; border: 1px solid #c6f6d5;
  }
  .summary-label {
    display: block; font-size: 11px; color: #718096; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
  }
  .summary-value { display: block; font-size: 22px; font-weight: 800; color: #2d3748; }
`;

const UploadTimetable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const admin_id = location.state?.admin_id;

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [summary, setSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ── File select via input ──
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) validateAndSet(selected);
  };

  // ── Drag & Drop ──
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  };

  const validateAndSet = (f) => {
    if (!f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
      setErrorMsg("Only .xlsx or .xls files are allowed.");
      setStatus("error");
      setFile(null);
      return;
    }
    setFile(f);
    setStatus("idle");
    setErrorMsg("");
    setSummary(null);
  };

  // ── Remove selected file ──
  const handleRemove = () => {
    setFile(null);
    setStatus("idle");
    setErrorMsg("");
    setSummary(null);
  };

  // ── Upload ──
  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setSummary(null);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:9000/api/upload-timetable", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setSummary(data.summary);
      } else {
        setStatus("error");
        setErrorMsg(data.message || "Upload failed. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("Could not connect to server. Please check the backend.");
    }
  };

  return (
    <>
      <style>{styles}</style>
      {/* HEADER */}
      <div className="admin-header">
        <div className="admin-header-content">

          <h2>UPLOAD TIMETABLE</h2>
          <div></div>
        </div>
      </div>

      {/* MAIN */}
      <div className="admin-main">
        <div className="upload-container">

          {/* Back Button */}
          <button
            className="back-btn"
            onClick={() => navigate("/admin-dashboard", { state: { admin_id } })}
          >
            <FaArrowLeft /> Back
          </button>

          {/* Drop Zone */}
          <div
            className={`drop-zone ${dragOver ? "drag-active" : ""} ${file ? "has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && document.getElementById("fileInput").click()}
          >
            <input
              id="fileInput"
              type="file"
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {!file ? (
              <>
                <FaCloudUploadAlt className="upload-icon" />
                <p className="drop-title">Drop Excel file here</p>
                <p className="drop-sub">or click to browse</p>
                <span className="file-badge">.xlsx / .xls</span>
              </>
            ) : (
              <div className="file-selected">
                <FaFileExcel className="excel-icon" />
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                >
                  <FaTimesCircle />
                </button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            className={`upload-btn ${!file || status === "uploading" ? "disabled" : ""}`}
            onClick={handleUpload}
            disabled={!file || status === "uploading"}
          >
            {status === "uploading" ? (
              <><FaSpinner className="spin" /> Uploading...</>
            ) : (
              <><FaCloudUploadAlt /> Upload Timetable</>
            )}
          </button>

          {/* Success Card */}
          {status === "success" && summary && (
            <div className="result-card success-card">
              <div className="result-header">
                <FaCheckCircle className="result-icon success-icon" />
                <h3>Timetable Uploaded Successfully!</h3>
              </div>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Version</span>
                  <span className="summary-value">v{summary.version}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Rows</span>
                  <span className="summary-value">{summary.total_rows}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">New Teachers</span>
                  <span className="summary-value">{summary.new_teachers}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">New Sections</span>
                  <span className="summary-value">{summary.new_sections}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">New Courses</span>
                  <span className="summary-value">{summary.new_courses}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Card */}
          {status === "error" && (
            <div className="result-card error-card">
              <FaTimesCircle className="result-icon error-icon" />
              <p>{errorMsg}</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default UploadTimetable;