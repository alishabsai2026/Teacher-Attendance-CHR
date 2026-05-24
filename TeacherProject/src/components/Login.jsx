import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/LOGO.png";
import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://192.168.100.92:1000";

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Email aur Password required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password_hash: password,
        }),
      });

      if (!res.ok) {
        alert("API Error: " + res.status);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      alert("Login Successful!");

      const role = data.role?.toLowerCase();

      // ✅ TEACHER LOGIN
      if (role === "teacher") {
        const teacherRes = await fetch(`${API_BASE}/get_teacher_id`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: data.user_id }),
        });

        if (!teacherRes.ok) {
          alert("Teacher API Error");
          setLoading(false);
          return;
        }

        const teacherData = await teacherRes.json();

        if (!teacherData.success) {
          alert(teacherData.message || "Teacher not found");
          setLoading(false);
          return;
        }

        localStorage.setItem("teacher_id", teacherData.teacher_id);
        localStorage.setItem("teacher_name", data.name);

        navigate("/dashboard", {
          state: {
            teacher_id: teacherData.teacher_id,
            name: data.name,
            user_id: data.user_id,
          },
        });
      }

      // ✅ GUARD LOGIN
      else if (role === "guard") {
        navigate("/guard-dashboard", {
          state: {
            name: data.name,
            user_id: data.user_id,
          },
        });
      }

      // ✅ DIRECTOR LOGIN
      else if (role === "director") {
        navigate("/director-dashboard", {
          state: {
            name: data.name,
            user_id: data.user_id,
          },
        });
      }

      // ✅ ADMIN LOGIN
      else if (role === "admin") {
        localStorage.setItem("admin_id", data.user_id);
        navigate("/admin-dashboard", {
          state: {
            name: data.name,
            user_id: data.user_id,
            admin_id: data.user_id,
          },
        });
      }

      else {
        alert("Unknown role: " + data.role);
      }

    } catch (error) {
      console.error(error);
      alert("Server Error");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Logo" className="login-logo" />

        <h2 className="login-title">TEACHER ATTENDANCE AND CHR</h2>

        <input
          type="email"
          placeholder="Email ID"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />

        <button
          onClick={handleLogin}
          className="login-btn"
          disabled={loading}
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>
      </div>
    </div>
  );
};

export default Login;