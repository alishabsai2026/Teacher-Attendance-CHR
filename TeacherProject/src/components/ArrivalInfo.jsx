import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/ArrivalInfo.css";

const ArrivalInfo = () => {
  const location = useLocation();

  const teacherId =
    location.state?.teacher_id || localStorage.getItem("teacher_id");

  const teacherName =
    location.state?.name || localStorage.getItem("teacher_name");

  const [arrivalData, setArrivalData] = useState([]);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchArrival = async () => {
      if (!teacherId) {
        setMsg("Teacher ID missing");
        return;
      }

      setLoading(true);
      setMsg("");

      try {
        const res = await fetch("http://localhost:21000/arrival_info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teacher_id: teacherId }),
        });

        const data = await res.json();

        console.log("API Response:", data); // Debug ke liye

        if (data.error) {
          setMsg(data.error);
          setArrivalData([]);
          return;
        }

        // arrival_info check - object hai ya nahi
        const arrivalInfo = data.arrival_info;

        if (
          !arrivalInfo ||
          typeof arrivalInfo !== "object" ||
          Object.keys(arrivalInfo).length === 0
        ) {
          setMsg("No Arrival Records Found");
          setArrivalData([]);
          return;
        }

        // Object ko array mein convert karo
        const arr = Object.entries(arrivalInfo).map(([date, info]) => ({
          date,
          day: info.day || "",
          status: info.status || "absent",
          hours: Number(info.hours) || 0,
          timeline: Array.isArray(info.timeline) ? info.timeline : [],
        }));

        // Date ke hisaab se sort karo (newest first)
        arr.sort((a, b) => new Date(b.date) - new Date(a.date));

        console.log("Parsed arrivalData:", arr); // Debug ke liye

        setArrivalData(arr);
        setWeeklyHours(data.weekly_hours || 0);
        setMsg("");
      } catch (err) {
        console.error("Fetch error:", err);
        setMsg("Server Error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArrival();
  }, [teacherId]);

  return (
    <div className="arrival-root">
      <div className="arrival-page">
        <div className="arrival-list">
          <h2 className="section-title">
            Arrival Info {teacherName ? `- ${teacherName}` : ""}
          </h2>

          {loading && <p>Loading...</p>}
          {msg && !loading && <p className="error-msg">{msg}</p>}

          {!loading && arrivalData.length > 0 && (
            <>
              <div className="table-wrapper">
                <table className="arrival-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Time In</th>
                      <th>Time Out</th>
                      <th>Status</th>
                      <th>Hours</th>
                    </tr>
                  </thead>

                  <tbody>
                    {arrivalData.map((item, index) =>
                      item.timeline.length === 0 ? (
                        // Timeline nahi hai toh single row
                        <tr key={index}>
                          <td>{item.date}</td>
                          <td>{item.day}</td>
                          <td>---</td>
                          <td>---</td>
                          <td
                            className={
                              item.status === "present"
                                ? "status-present"
                                : "status-absent"
                            }
                          >
                            {item.status === "present" ? "Present" : "Absent"}
                          </td>
                          <td>{item.hours}</td>
                        </tr>
                      ) : (
                        // Har timeline entry ke liye alag row
                        item.timeline.map((log, i) => (
                          <tr key={`${index}-${i}`}>
                            <td>{i === 0 ? item.date : ""}</td>
                            <td>{i === 0 ? item.day : ""}</td>
                            <td>{log.in || "---"}</td>
                            <td>{log.out || "---"}</td>
                            <td
                              className={
                                item.status === "present"
                                  ? "status-present"
                                  : "status-absent"
                              }
                            >
                              {i === 0
                                ? item.status === "present"
                                  ? "Present"
                                  : "Absent"
                                : ""}
                            </td>
                            <td>{i === 0 ? item.hours : ""}</td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="total-hours">
                <span>Total Weekly Hours</span>
                <span>{weeklyHours}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArrivalInfo;