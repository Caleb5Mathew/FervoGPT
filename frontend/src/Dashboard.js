import React, { useState, useEffect, useRef } from "react";
import { useMsal, useAccount } from "@azure/msal-react";
import "./DashboardShell.css"; // Only layout & nav styles here
import Goofy from "./goofy/Goofy";
import HistoryList from "./HistoryList";
import GoofyProfile from "./goofy/GoofyProfile";
import ChatView from "./ChatView";
import ThemeSelector from "./components/ThemeSelector"; // ✅ Updated name
import { loadStoredTheme } from "./components/ThemeManager"; // ✅ Theme logic
import useIsMobileLayout from "./hooks/useIsMobileLayout"; // ✅ New import

// -- Sidebar Component --
function Sidebar({ active, onSelect, sidebarOpen, onClose }) {
  const handleItemClick = (view) => {
    onSelect(view);
    if (sidebarOpen) onClose();
  };

  return (
    <nav className={`sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-header-bar">
        <span className="sidebar-header">DrillingGPT</span>
        <button
          className="sidebar-close"
          aria-label="Close menu"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <ul>
        <li
          className={`nav-item ${active === "chats" ? "active" : ""}`}
          onClick={() => handleItemClick("chats")}
        >
          Chats
        </li>
        <li
          className={`nav-item ${active === "history" ? "active" : ""}`}
          onClick={() => handleItemClick("history")}
        >
          History
        </li>
        <li
          className={`nav-item ${active === "goofy" ? "active" : ""}`}
          onClick={() => handleItemClick("goofy")}
        >
          Goofball3000
        </li>
      </ul>
    </nav>
  );
}

function TopBar({ onNewChat, username, onLogout, onToggleSidebar, isMobileLayout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="top-bar">
      <button
        className="menu-btn"
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <input type="text" className="search-input" placeholder="Find..." />
      <button className="new-chat-btn" onClick={onNewChat}>
        New Chat
      </button>
      <div
        className={`account-menu ${dropdownOpen ? "open" : ""}`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        ref={dropdownRef} // ✅ Apply ref here
      >
        <div className="profile-icon" />
        <span className="username">{username}</span>
        <span className="caret">▾</span>
        {dropdownOpen && (
          <div className="account-dropdown" onClick={(e) => e.stopPropagation()}>
            {isMobileLayout && (
              <div className="item profile-email">{username}</div>
            )}
            <ThemeSelector />
            <div className="item sign-out" onClick={onLogout}>
              Sign Out
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// -- Main Dashboard --
export default function Dashboard() {
  const { instance } = useMsal();
  const accounts = instance.getAllAccounts() || [];
  const account = useAccount(accounts[0] || {});
  const username = account?.username || "User";

  const [view, setView] = useState("chats");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("");

  const isMobileLayout = useIsMobileLayout(); // ✅ Hook used here

  useEffect(() => {
    loadStoredTheme(); // ✅ Apply stored theme and mode
  }, []);

  const handleNewChat = () => {
    setView("chats");
  };

  const handleLogout = () => {
    instance.logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const selectView = (v) => {
    setView(v);
    setSidebarOpen(false);
  };

  const handleSelectProfile = (name) => {
    setSelectedPerson(name);
    setView("profile");
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-container">
      <div
        className={`overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={toggleSidebar}
      />

      <Sidebar
        active={view}
        onSelect={selectView}
        sidebarOpen={sidebarOpen}
        onClose={toggleSidebar}
      />

      <div className="main-content">
        <TopBar
          onNewChat={handleNewChat}
          username={username}
          onLogout={handleLogout}
          onToggleSidebar={toggleSidebar}
          isMobileLayout={isMobileLayout} // ✅ Pass to TopBar
        />

        <div className="workspace">
          {view === "chats" && <ChatView />}
          {view === "history" && <HistoryList />}
          {view === "goofy" && <Goofy onSelectProfile={handleSelectProfile} />}
          {view === "profile" && (
            <GoofyProfile
              name={selectedPerson}
              onBack={() => setView("goofy")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
