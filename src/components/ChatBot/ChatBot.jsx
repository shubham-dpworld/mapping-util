import React, { useState } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you today?", type: "text" },
  ]);
  const [step, setStep] = useState("init");
  const [formData, setFormData] = useState({ process: "", trackId: "", from: "", to: "" });
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const resetChat = () => {
    setMessages([{ sender: "bot", text: "Hi! How can I help you today?", type: "text" }]);
    setStep("init");
    setFormData({ process: "", trackId: "", from: "", to: "" });
    setLoading(false);
  };

  const sendMessage = (text, sender = "user") => {
    setMessages((prev) => [...prev, { sender, text, type: "text" }]);
  };

  const handleSelectOption = (option) => {
    sendMessage(option === "1" ? "🔍 Check Unique Key Status" : "❓ Other Issue", "user");
    if (option === "1") {
      setMessages((prev) => [...prev, { sender: "bot", text: "Please enter the process name:", type: "text" }]);
      setStep("getProcess");
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "This feature is coming soon!", type: "text" },
        { sender: "bot", text: "Would you like to start over?", type: "text" },
      ]);
      setStep("restart");
    }
  };

  const handleUserInput = async (e) => {
    e.preventDefault();
    const input = e.target.userInput.value.trim();
    if (!input) return;
    sendMessage(input);

    if (step === "getProcess") {
      setFormData((prev) => ({ ...prev, process: input }));
      setMessages((prev) => [...prev, { sender: "bot", text: "Please enter the Track ID:" }]);
      setStep("getTrackId");
    } else if (step === "getTrackId") {
      setFormData((prev) => ({ ...prev, trackId: input }));
      setMessages((prev) => [...prev, { sender: "bot", text: "Enter time range (YYYY-MM-DD to YYYY-MM-DD):" }]);
      setStep("getTimeRange");
    } else if (step === "getTimeRange") {
      const [from, to] = input.split("to").map((v) => v.trim());
      const updatedForm = { ...formData, from, to };
      setFormData(updatedForm);
      setLoading(true);

      try {
        const response = await fetch("http://localhost:8000/api/boomi/track-field/status/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ProcessKey: updatedForm.process,
            FromTime: updatedForm.from,
            ToTime: updatedForm.to,
            TrackKey: updatedForm.trackId,
          }),
        });

        
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: `Here's what I found:\n• ProcessName: ${data.ProcessName}\n• Status: ${data.Status}\n• ExecutionTime: ${data.ExecutionTime}\n• Duration: ${data.ExecutionDuration} ms\n• Execution ID: ${data.ExecutionId}`, type: "text" },
            { sender: "bot", text: "Would you like to start another query?", type: "text" },
          ]);
        } else {
          setMessages((prev) => [...prev, { sender: "bot", text: `Error: ${data.error || "Something went wrong"}` }]);
        }
      } catch (err) {
        setMessages((prev) => [...prev, { sender: "bot", text: `Error: ${err.message}` }]);
      } finally {
        setLoading(false);
        setStep("restart");
      }
    } else if (step === "restart") {
      if (/yes|start|again/i.test(input)) {
        resetChat();
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: "Okay! Feel free to reach out if you need more help." }]);
        setStep("done");
      }
    }

    e.target.userInput.value = "";
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={toggleChat}>💬</button>
      {isOpen && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            Support Assistant
            <button className="chatbot-reset" onClick={resetChat}>⟳ Reset</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-msg ${msg.sender}`}>{msg.text}</div>
            ))}
            {step === "init" && (
              <div className="chatbot-options">
                <button onClick={() => handleSelectOption("1")}>🔍 Check Unique Key Status</button>
                <button onClick={() => handleSelectOption("2")}>❓ Other Issue</button>
              </div>
            )}
            {loading && <div className="chatbot-msg bot">Fetching result...</div>}
          </div>
          {step !== "init" && step !== "done" && (
            <form className="chatbot-input" onSubmit={handleUserInput}>
              <input type="text" name="userInput" placeholder="Type your message..." autoComplete="off" />
              <button type="submit">Send</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
