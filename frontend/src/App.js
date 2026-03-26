import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from "react-router-dom";
import AuthService from "./services/auth.service";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Subjects from "./components/Subjects";
import Quiz from "./components/Quiz";
import RecallCheck from "./components/RecallCheck";
import AdminDashboard from "./components/AdminDashboard";
import AiTutor from "./components/AiTutor";
import ChatbotWidget from "./components/ChatbotWidget";
import "./App.css";

const App = () => {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
  };

  return (
    <Router>
      <div>
        <nav className="navbar">
          <Link to={"/"} className="navbar-brand">
            KnowGap
          </Link>
          <div className="nav-links">
            <NavLink to={"/home"} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              Home
            </NavLink>

            {currentUser ? (
              <>
                <NavLink to={"/subjects"} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                  Subjects
                </NavLink>
                <NavLink to={"/ai-tutor"} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                  AI Tutor
                </NavLink>
                <NavLink to={"/dashboard"} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                  Dashboard
                </NavLink>
                {currentUser.role === "ROLE_ADMIN" && (
                  <NavLink to={"/admin"} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} style={{ 
                    border: '1px solid var(--primary)', 
                    borderRadius: '8px',
                    padding: '0.4rem 1rem',
                    color: 'var(--primary)'
                  }}>
                    Admin Panel
                  </NavLink>
                )}
                <a href="/login" className="nav-link" onClick={logOut}>
                  LogOut
                </a>
              </>
            ) : (
              <>
                <NavLink to={"/login"} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                  Login
                </NavLink>
                <NavLink to={"/register"} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                  Sign Up
                </NavLink>
                <NavLink to={"/ai-tutor"} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                  AI Tutor
                </NavLink>
              </>
            )}
          </div>
        </nav>

        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/ai-tutor" element={<AiTutor />} />
            <Route path="/quiz/:topicId" element={<Quiz />} />
            <Route path="/recall/:subjectId" element={<RecallCheck />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          <ChatbotWidget />
        </div>
      </div>
    </Router>
  );
};

export default App;