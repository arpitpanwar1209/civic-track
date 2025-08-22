// frontend/src/App.js
import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Issues from "./pages/issue";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import SubmitIssue from "./pages/submitissue";  
import Profile from "./pages/profile";
import EditIssue from "./pages/EditIssue";

function App() {
  return (
    <Router>
      <div className="App">
        {/* ✅ Navbar */}
        <nav style={{ padding: "10px", background: "#2c3e50" }}>
          <Link to="/" style={{ margin: "0 10px", color: "#fff" }}>Home</Link>
          <Link to="/login" style={{ margin: "0 10px", color: "#fff" }}>Login</Link>
          <Link to="/signup" style={{ margin: "0 10px", color: "#fff" }}>Signup</Link>
          <Link to="/dashboard" style={{ margin: "0 10px", color: "#fff" }}>Dashboard</Link>
          <Link to="/submit" style={{ margin: "0 10px", color: "#fff" }}>Submit Issue</Link>
          <Link to="/profile" style={{ margin: "0 10px", color: "#fff" }}>Profile</Link>
        </nav>

        {/* ✅ App Header */}
        <header className="App-header" style={{ padding: "20px" }}>
          <h1>CivicTrack 🏙️</h1>
          <p>Community Issues Near You</p>
        </header>

        {/* ✅ Routes (single place only) */}
        <main style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/submit" element={<SubmitIssue />} /> 
            <Route path="/profile" element={<Profile />} />
            <Route path="/issues/:id/edit" element={<EditIssue />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
