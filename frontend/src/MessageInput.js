// frontend/src/MessageInput.js
import React, { useState } from "react";
import "./ChatInterface.css";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  const submit = () => {
    onSend(text);
    setText("");
  };

  return (
    <div className="message-input-container">
      <textarea
        className="message-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Ask a drilling question…"
      />
      <button className="send-btn" onClick={submit}>
        Send
      </button>
    </div>
  );
}
