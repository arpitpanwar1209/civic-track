import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

// Components
import AppNavbar from "./components/AppNavbar";
import ToasterProvider from "./components/Toaster";
import FabReport from "./components/FabReport";

// Pages
import Home from "./pages/home";
import Issues from "./pages/issue";
import IssueDetail from "./pages/IssueDetail"; // ⬅️ REQUIRED
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

        {/* Navbar should NOT be global */}
        <Routes>
          {/* Public / landing */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

          {/* App layout routes */}
          <Route
            path="/*"
            element={
              <>
                <AppNavbar />

                <main className="container py-4">
                  <Routes>
                    <Route path="issues" element={<Issues />} />
                    <Route path="issues/:id" element={<IssueDetail />} />
                    <Route path="issues/:id/edit" element={<EditIssue />} />
                    <Route path="issues/submit" element={<SubmitIssue />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                  </Routes>
                </main>

                <FabReport />
              </>
            }
          />
        </Routes>

      </ToasterProvider>
    </Router>
  );
}

export default App;
