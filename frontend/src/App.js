import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Issues from "./pages/issue";
import Login from "./pages/login";
import Signup from "./pages/signup";
import LoginAdmin from "./pages/loginadmin";
import LoginOfficial from "./pages/loginofficial";
import LoginUser from "./pages/loginuser";
import SignupUser from "./pages/signupuser";
import issuelist from"./components/issueslist";


function App() {
  return (
    <Router>
      <div className="App">
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
