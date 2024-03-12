import React from "react";
import "./App.css";
import Header from "./components/header/header";
import Login from "./components/login/login";
import Home from "./components/home/home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Login />} exact />
            <Route path="home" element={<Home />} exact />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
