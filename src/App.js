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
import Project from "./components/project/project";
import ProjectEditForm from "./components/project/ProjectEditForm";
import AddTask from "./components/project/add-task";
import AddSprint from "./components/project/sprints/add-sprint";
import EditProfile from "./components/user-profile/edit-profile";
import EditSprint from "./components/project/sprints/edit-sprint";
import Users from "./components/users/users";
import AddUserStory from "./components/project/userStory/add-userStory";
import EditStory from "./components/project/userStory/edit-userStory";
import Sprints from "./components/project/userStory/storyList";
import DiagramBurnDown from "./components/diagram-burn-down/diagram-burn-down";

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
              <Route path="/user-profile/edit" element={<EditProfile />} />
              <Route path="users" element={<Users />} exact />
              <Route path="/project/:projectId" element={<Project />} />
              <Route
                path="/projects/planning-poker/:projectId"
                element={<PlanningPoker />}
              />
              <Route
                path="/projects/diagram/:projectId"
                element={<DiagramBurnDown />}
              />
              <Route
                path="/projects/edit/:projectId"
                element={<ProjectEditForm />}
              />
              <Route
                path="/projects/add-task/:projectId"
                element={<AddTask />}
              />
              <Route
                path="/projects/add-sprint/:projectId"
                element={<AddSprint />}
              />
              <Route
                path="/projects/add-userStory/:projectId"
                element={<AddUserStory />}
              />
              <Route
                path="/projects/edit-sprint/:sprintId"
                element={<EditSprint />}
              />
              <Route
                path="/projects/edit-story/:storyId"
                element={<EditStory />}
              />
              <Route
                path="/projects/listSprints/:projectId"
                element={<Sprints />}
              />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
