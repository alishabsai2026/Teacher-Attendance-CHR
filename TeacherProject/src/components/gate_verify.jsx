import React, { useState, useRef } from "react";
import "../styles/gate_verify.css";

export default function GateAttendanceScreen() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setImage(file);
  };

  const openCamera  = () => cameraInputRef.current?.click();
  const openGallery = () => fileInputRef.current?.click();

  const showToast = (type, message) => setToast({ type, message });
  const closeToast = () => setToast(null);

  const sendAttendance = async () => {
    if (!image) {
      showToast("error", "Please select or capture an image first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://192.168.100.92:8000/auto_attendance", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        showToast("error", `Server error ${response.status}: ${response.statusText}\n${errorText.substring(0, 200)}`);
        return;
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        let message = "";
        data.results.forEach((res, index) => {
          message += `${index + 1}. ${res.teacher_name} — ${res.action?.toUpperCase() || "Error"} at ${res.time || "—"}\n`;
          if (res.duration) message += `   Duration: ${res.duration} min\n`;
          if (res.error)    message += `   Error: ${res.error}\n`;
        });
        showToast("success", message.trim());
      } else {
        showToast("error", "No face recognized in the image.");
      }

      // Reset image
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current)   fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";

    } catch (error) {
      showToast("error", "Network Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gate-container">
      <div className="gate-inner">

        {/* ── HEADER ── */}
        <div className="gate-header">
          <div className="gate-icon-wrap">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/>
              <path d="M9 2 7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.17L15 2H9Zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/>
            </svg>
          </div>
          <div className="gate-title-wrap">
            <h1>Gate Attendance</h1>
            <p>Capture or upload a photo to mark attendance</p>
          </div>
        </div>

        <hr className="gate-divider" />

        {/* ── HIDDEN INPUTS ── */}
        <input type="file" accept="image/*" capture="environment"
          ref={cameraInputRef} onChange={handleFileSelect} className="hidden-input" />
        <input type="file" accept="image/*"
          ref={fileInputRef} onChange={handleFileSelect} className="hidden-input" />

        {/* ── IMAGE BOX (no badge) ── */}
        <div className="camera-circle" onClick={openCamera}>
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          ) : (
            <div className="camera-empty">
              <div className="camera-empty-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/>
                  <path d="M9 2 7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.17L15 2H9Zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/>
                </svg>
              </div>
              <span className="camera-empty-label">Tap to open camera</span>
              <span className="camera-empty-sub">JPG, PNG supported</span>
            </div>
          )}
        </div>

        {/* ── GALLERY LINK ── */}
        <div className="gallery-link" onClick={openGallery}>
          Or Select from Gallery
        </div>

        {/* ── SEND BUTTON ── */}
        <button className="send-button" onClick={sendAttendance} disabled={loading}>
          {loading ? "Processing..." : (
            <>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
              SEND
            </>
          )}
        </button>

        {/* ── IN-SCREEN TOAST (replaces browser alert) ── */}
        {toast && (
          <div className="toast-overlay">
            <div className="toast-box">
              <div className="toast-header">
                <span className={`toast-dot ${toast.type}`} />
                <span className="toast-title">
                  {toast.type === "success" ? "Attendance Marked" : "Notice"}
                </span>
              </div>
              <div className="toast-body">{toast.message}</div>
              <button className="toast-close" onClick={closeToast}>OK</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}