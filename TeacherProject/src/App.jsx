//import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Dashboard from "./components/Dashboard";
// import Timetable from "./components/Timetable";
// import ArrivalInfo from "./components/ArrivalInfo";
// import ClaimPage from "./components/ClaimPage"; 

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Dashboard />} />
//         <Route path="/timetable" element={<Timetable />} />
//         <Route path="/arrival-info" element={<ArrivalInfo />} />
//         <Route path="/claim" element={<ClaimPage />} /> 
//       </Routes>
//     </BrowserRouter>
//   );
// }




// import React from "react";


// import Login from "./components/Login";
// import Dashboard from "./components/Dashboard";
// import Timetable from "./components/Timetable";
// import ArrivalInfo from "./components/ArrivalInfo";
// import CHRDetails from "./components/CHRDetails";
// import Settings from "./components/Setting";import GuardDashboard from "./components/GuardDashboard";



// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/timetable" element={<Timetable />} />
//         <Route path="/arrival-info" element={<ArrivalInfo />} />
//         <Route path="/chr-details" element={<CHRDetails />} />
//         <Route path="/settings" element={<Settings />} /> {/* ✅ Fixed */}
//         <Route path="/guard-dashboard" element={<GuardDashboard />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Timetable from "./components/Timetable";
import ArrivalInfo from "./components/ArrivalInfo";
import CHRDetails from "./components/CHRDetails";
import Settings from "./components/Setting";
import GuardDashboard from "./components/GuardDashboard";
import SlotOverview from "./components/SlotOverview";
import SlotTeachers from "./components/SlotTeachers";
import InOutStatus from "./components/InOutStatus";
import GateVerify from "./components/gate_verify";
import SwapScreen from "./components/swapScreen";
import AdminDashboard from "./components/AdminDashboard";
import AdminSwap from "./components/AdminSwap";
import DirectorDashboard from "./components/DirectorDashboard";
import WeeklyHours from "./components/WeeklyHours";
import CHRReport from "./components/chrReport";
import Leave from "./components/Leave";
import OnLeave from "./components/Onleave";
import ManualVerify from "./components/Manual_verify";
import UploadTimetable from "./components/UploadTimetable";
import ThresholdTime from "./components/ThresholdTime";
import OverallSummary from "./components/OverallSummary";
import TodayStatus from "./components/TodayStatus";
import WeeklyLowHours from "./components/WeeklyLowHours";
import BackdatedEntry from "./components/BackdatedEntry"; {/* ✅ Backdated Entry */}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/arrival-info" element={<ArrivalInfo />} />
        <Route path="/chr-details/:teacher_id" element={<CHRDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/guard-dashboard" element={<GuardDashboard />} />
        <Route path="/slot-overview" element={<SlotOverview />} />
        <Route path="/slot-teachers" element={<SlotTeachers />} />
        <Route path="/inout-status" element={<InOutStatus />} />
        <Route path="/gate-verify" element={<GateVerify />} />
        <Route path="/swap" element={<SwapScreen />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-swap" element={<AdminSwap />} />
        <Route path="/director-dashboard" element={<DirectorDashboard />} />
        <Route path="/teachers-weekly-hours" element={<WeeklyHours />} />
        <Route path="/chr-report" element={<CHRReport />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/on-leave" element={<OnLeave />} />
        <Route path="/manual-verify" element={<ManualVerify />} />
        <Route path="/upload-timetable" element={<UploadTimetable />} />
        <Route path="/threshold-time" element={<ThresholdTime />} />
        <Route path="/overall-summary" element={<OverallSummary />} />
        <Route path="/today-status" element={<TodayStatus />} />
        <Route path="/weekly-low-hours" element={<WeeklyLowHours />} />
        <Route path="/backdated-entry" element={<BackdatedEntry />} /> {/* ✅ Backdated Entry */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;