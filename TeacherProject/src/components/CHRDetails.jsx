import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "../styles/CHRDetails.css";

const CHRDetails = () => {
  const { teacher_id } = useParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dateInputRef = useRef(null);

  const formatDateForBackend = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    console.log("teacher_id from URL:", teacher_id);
    if (!teacher_id) {
      console.error("teacher_id is undefined! Check your route.");
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const formattedDate = formatDateForBackend(selectedDate);
        const url = `http://192.168.100.92:13000/chr/get/${teacher_id}`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: formattedDate }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          setRecords(data.chr || []);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        if (isMounted) {
          setRecords([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, teacher_id]);

  const handleCalendarClick = () => {
    dateInputRef.current?.showPicker();
  };

  const handleDateChange = (event) => {
    const dateStr = event.target.value;
    if (dateStr) {
      const [year, month, day] = dateStr.split("-").map(Number);
      setSelectedDate(new Date(year, month - 1, day));
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const headers = [
    "Slot",
    "Day",
    "Venue",
    "Section",
    "Status",
    "Time In",
    "Time Out",
    "Duration",
  ];

  return (
    <div className="chr-root"> {/* 🔥 ONLY ADDITION */}
      <div className="container">

        <div className="dateRow">
          <p className="dateText">
            {isToday
              ? `Today's CHR (${formatDateDisplay(selectedDate)})`
              : `CHR of ${formatDateDisplay(selectedDate)}`}
          </p>
          <button className="calendarButton" onClick={handleCalendarClick}>
            📅
          </button>
          <input
            type="date"
            ref={dateInputRef}
            value={formatDateForBackend(selectedDate)}
            onChange={handleDateChange}
            style={{ display: "none" }}
          />
        </div>

        {isLoading && <div className="loader">Loading...</div>}

        {!isLoading && records.length === 0 && (
          <p className="noRecords">No class record for this date</p>
        )}

        {!isLoading && records.length > 0 && (
          <div className="tableContainer">
            <div className="headerRow">
              {headers.map((head, index) => (
                <span
                  key={index}
                  className={`headerCell ${
                    index !== headers.length - 1 ? "headerBorder" : ""
                  }`}
                >
                  {head}
                </span>
              ))}
            </div>

            {records.map((item, index) => (
              <div
                key={index}
                className={`dataRow ${index % 2 === 0 ? "evenRow" : ""}`}
              >
                <span className="dataCell">{item.slot}</span>
                <span className="dataCell">{item.day}</span>
                <span className="dataCell">{item.venue}</span>
                <span className="dataCell">{item.section_name || "-"}</span>
                <span className="dataCell">{item.status}</span>
                <span className="dataCell">{item.time_in}</span>
                <span className="dataCell">{item.time_out}</span>
                <span className="dataCell">{item.duration}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default CHRDetails;