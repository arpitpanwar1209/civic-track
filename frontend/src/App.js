import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import ToasterProvider from "./components/Toaster";

// Pages
import Home from "./pages/home";
import Issues from "./pages/issue";
import IssueDetail from "./pages/IssueDetail";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import SubmitIssue from "./pages/submitissue";
import Profile from "./pages/profile";
import EditIssue from "./pages/EditIssue";
import ResetPassword from "./pages/ResetPassword";

// Layout
import AppLayout from "./layouts/AppLayouts";

function App() {
  return (
    <Router>
      <ToasterProvider>
        <Routes>
          {/* Public / landing */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/reset-password/:uid/:token"
            element={<ResetPassword />}
          />

          {/* App layout */}
          <Route element={<AppLayout />}>
            <Route path="/issues" element={<Issues />} />
            <Route path="/issues/:id" element={<IssueDetail />} />
            <Route path="/issues/:id/edit" element={<EditIssue />} />
            <Route path="/issues/submit" element={<SubmitIssue />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </ToasterProvider>
    </Router>
  );
}

export default App;
