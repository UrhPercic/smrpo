import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Header from "./components/header/header";
import Login from "./components/login/login";
import Home from "./components/home/home";
import AddProject from "./components/add-project/add-project";
import UserProfile from "./components/user-profile/user-profile";
import AddUser from "./components/add-user/add-user";
import Layout from "./layout";
import PlanningPoker from "./components/planning-poker/planning-poker";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Login />} exact />
            <Route element={<Layout />}>
              <Route path="home" element={<Home />} exact />
              <Route path="add-project" element={<AddProject />} exact />
              <Route path="add-user" element={<AddUser />} exact />
              <Route path="user-profile" element={<UserProfile />} exact />
              <Route path="planning-poker" element={<PlanningPoker />} exact />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
