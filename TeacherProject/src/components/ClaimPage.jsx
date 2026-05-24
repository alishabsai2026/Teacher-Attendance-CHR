// import { useLocation, useNavigate } from "react-router-dom";
// import "../styles/ClaimPage.css";

// function ClaimPage() {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   const record = state || {
//     date: "-",
//     inTime: "-",
//     outTime: "-",
//     status: "-",
//   };

//   return (
//     <>
//       <div className="claim-header">
//         <h2>Claims</h2>
//       </div>

//       <div className="claim-container">
//         <div className="claim-card">

//           {/* 🔥 NEW INNER WRAPPER */}
//           <div className="claim-content">

//             <div className="claim-row">
//               <span>Date</span>
//               <span>{record.date}</span>
//             </div>

//             <div className="claim-row">
//               <span>In Time</span>
//               <span>{record.inTime}</span>
//             </div>

//             <div className="claim-row">
//               <span>Out Time</span>
//               <span>{record.outTime}</span>
//             </div>

//             <div className="claim-row">
//               <span>Status</span>
//               <span>{record.status}</span>
//             </div>

//             <label className="claim-label">Reason for Claim</label>
//             <textarea
//               className="claim-textarea"
//               placeholder="I was present but system didn't record my entry."
//             ></textarea>

//             <label className="claim-label">Attach Proof (optional)</label>

//             <label className="upload-box">
//               📎 Upload Photo / Document
//               <input type="file" hidden />
//             </label>

//             <div className="claim-buttons">
//               <button className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
//               <button className="submit-btn">Submit Claim</button>
//             </div>

//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default ClaimPage;
