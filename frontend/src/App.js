import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import AppNavbar from "./components/AppNavbar";
import ToasterProvider from "./components/Toaster";
import FabReport from "./components/FabReport";

// Pages
import Home from "./pages/home";
import Issues from "./pages/issue";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import SubmitIssue from "./pages/submitissue";
import Profile from "./pages/profile";
import EditIssue from "./pages/EditIssue";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Router>
      <ToasterProvider>
        {/* ✅ Only one navbar */}
        <AppNavbar />

        {/* ✅ App Pages */}
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
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          </Routes>
        </main>

        {/* ✅ Always accessible floating action button */}
        <FabReport />
      </ToasterProvider>
    </Router>
  );
}

export default App;
