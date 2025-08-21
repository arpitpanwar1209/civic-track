import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Issues from "./pages/issue";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import SubmitIssue from "./pages/submitissue";


function App() {
  return (
    <Router>
      <div className="App">
        <div className="App">
        {/* ✅ Navbar */}
        <nav style={{ padding: "10px", background: "#2c3e50" }}>
          <Link to="/" style={{ margin: "0 10px", color: "#fff" }}>Home</Link>
          <Link to="/login" style={{ margin: "0 10px", color: "#fff" }}>Login</Link>
          <Link to="/signup" style={{ margin: "0 10px", color: "#fff" }}>Signup</Link>
          <Link to="/dashboard" style={{ margin: "0 10px", color: "#fff" }}>Dashboard</Link>
          <Link to="/submit" style={{ margin: "0 10px", color: "#fff" }}>Submit Issue</Link>
        </nav>

        {/* ✅ Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit" element={<SubmitIssue />} />
          <Route path="/issue" element={<Issues />} />
        </Routes>
      </div>

        {/* Header */}
        <header className="App-header" style={{ padding: "20px" }}>
          <h1>CivicTrack 🏙️</h1>
          <p>Community Issues Near You</p>
          <nav style={{ marginTop: "15px" }}>
            <Link to="/" style={{ margin: "0 10px" }}>Issues</Link>
            <Link to="/login" style={{ margin: "0 10px" }}>Login</Link>
            <Link to="/signup" style={{ margin: "0 10px" }}>Signup</Link>
          </nav>
        </header>

        {/* Routes */}
        <main style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Issues />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
