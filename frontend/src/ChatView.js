// src/ChatView.js
import React, { useState, useEffect, useRef } from "react";
import LogoSpinner from "./components/LogoSpinner";
import MessageInput from "./MessageInput";
import "./ChatInterface.css";

// 1) Import ReactMarkdown & GFM plugin
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API = process.env.REACT_APP_API_URL;

export default function ChatView() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);
  const threadRef = useRef();

  // auto-scroll to bottom on new messages/loading
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // 1) show user message
    setMessages((m) => [...m, { sender: "user", text }]);
    setLoading(true);

    try {
      // 2) call the RAG backend
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      if (!res.ok) throw new Error(res.statusText);

      const { answer } = await res.json();
      // 3) show assistant’s reply (Markdown-formatted)
      setMessages((m) => [...m, { sender: "assistant", text: answer }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { sender: "assistant", text: "❌ Failed to load response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-thread" ref={threadRef}>
        {/* 4) Wrap all bubbles inside .chat-panel so they stay centered at max-width */}
        <div className="chat-panel">
          {messages.map((m, i) => (
            <div key={i} className={`message-row ${m.sender}`}>
              <div className={`message-bubble ${m.sender}`}>
                {m.sender === "assistant" ? (
                  // For assistant messages, render Markdown → HTML
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.text}
                  </ReactMarkdown>
                ) : (
                  // For user messages, just show the plain text (no Markdown needed)
                  m.text
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant">
              <div className="message-bubble spinner-bubble">
                <LogoSpinner size={40} />
              </div>
            </div>
          )}
        </div>
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  );
}
