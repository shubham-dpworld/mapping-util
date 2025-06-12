import React, { useState } from "react";
import "../ComponentGeneratorWithExcel/ComponentGeneratorWithExcel.css"; // reusing your styles

const SupportPage = () => {
  const [trackKey, setTrackKey] = useState("");
  const [processName, setProcessName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [error, setError] = useState("");

  const handleStatusCheck = async () => {
    if (!trackKey.trim()) return setError("Please enter a valid key");
    if (!processName.trim()) return setError("Please enter a process name");
    if (!fromDate.trim()) return setError("Please enter a from Date");
    if (!toDate.trim()) return setError("Please enter a to Date");
    setError("");
    setLoading(true);
    setStatusResult(null);

    try {
   
      const response = await fetch("http://localhost:8000/api/boomi/track-field/status/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ProcessKey: processName,
          FromTime: fromDate,
          ToTime: toDate,
          TrackKey: trackKey
        }),
      });

    if (!response.ok) throw new Error("Status not found");
    const data = await response.json();
    

//       const data = `{
//   "ProcessName" : "(Main)_CT_NPM>CMA_InstaQuote_WSS",
//   "Status" : "COMPLETE",
//   "ExecutionTime" : "20250515 193954.000",
//   "ExecutionDuration" : "2500",
//   "ExecutionId" : "execution-320d53aa-3c3d-4361-9474-31eaf0b26f15-2025.05.15",
//   "TrackKey" : [
//     "eaff756f-b29a-40ff-8d1a-f8f857017f02"
//   ]
// }
// `;
 
    setStatusResult(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatExecutionTime = (raw) => {
    if (!raw) return "";
    const [datePart, timePart] = raw.split(" ");
    const year = datePart.slice(0, 4);
    const month = datePart.slice(4, 6);
    const day = datePart.slice(6, 8);
  
    const hour = timePart.slice(0, 2);
    const minute = timePart.slice(2, 4);
    const second = timePart.slice(4, 6);
  
    const dateObj = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  

  return (
    <div className="form-wrapper">
      <h1 className="title">Support & Status Lookup</h1>
      <p className="description">
        Need help? Submit a request or check the status of your existing request using a unique ID.
      </p>

      {/* TrackKey Search */}
      <div className="form-section">
        <h2>Track Your Request</h2>
        <div className="form-group">
          <label>Enter Process Name *</label>
          <input
            type="text"
            value={processName}
            onChange={(e) => setProcessName(e.target.value)}
            className={error ? "error" : ""}
            placeholder="e.g. CMA_InstaQuote_WSS"
          />
          <label>Enter Unique Request ID *</label>
          <input
            type="text"
            value={trackKey}
            onChange={(e) => setTrackKey(e.target.value)}
            className={error ? "error" : ""}
            placeholder="e.g. eaff756f-b29a-40ff-8d1a-f8f857017f02"
          />
          <label>Enter From Date *</label>
          <input
            type="text"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={error ? "error" : ""}
            placeholder="e.g. 2025-05-15T00:00:00Z"
          />
          <label>Enter To Date *</label>
          <input
            type="text"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={error ? "error" : ""}
            placeholder="e.g. 2025-05-15T00:00:00Z"
          />
          {error && <span className="error-message">{error}</span>}
        </div>
        <button className="submit-btn" onClick={handleStatusCheck} disabled={loading}>
          {loading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              <span>Hang on tight, we are getting the result...</span>
            </div>
          ) : (
            "Check Status"
          )}
        </button>
      </div>

      {/* Status Result */}
      {statusResult && (
        <div className="result-message success">
          <h3>Request Status</h3>
          <div className="component-details">
            <p><strong>Process:</strong> {statusResult.ProcessName}</p>
            <p><strong>Status:</strong> {statusResult.Status}</p>
            <p><strong>Execution Time:</strong> {formatExecutionTime(statusResult.ExecutionTime)}</p>
            <p><strong>Duration:</strong> {statusResult.ExecutionDuration} ms</p>
            <p><strong>Execution ID:</strong> {statusResult.ExecutionId}</p>
            <p><strong>Track Key:</strong> {statusResult.TrackKey?.join(", ")}</p>
          </div>
        </div>
      )}

      {/* Support Form */}
      <div className="form-section">
        <h2>Submit a Support Request</h2>
        <p style={{
          color: '#555',
          lineHeight: '1.6',
          padding: '6px 16px',
}}>For any issue or clarification, contact us via internal support channels or raise a ticket.</p>
      </div>
    </div>
  );
};

export default SupportPage;
