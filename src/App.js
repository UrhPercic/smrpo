import React from "react";
import "./App.css";
import Header from "./components/header/header";
import Login from "./components/login/login";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Login />} exact />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
