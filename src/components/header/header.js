import React from "react";
import { useLocation } from "react-router-dom";
import "./header.css";

const Header = () => {
  const location = useLocation();

  const getTitle = (pathname) => {
    if (pathname.startsWith("/project/")) {
      return "Project";
    }
    if (pathname.startsWith("/projects/edit/")) {
      return "Edit Project";
    }
    if (pathname.startsWith("/projects/add-task/")) {
      return "Add task to project";
    }
    if (pathname.startsWith("/projects/diagram/")) {
      return "Diagram burn down";
    }
    if (pathname.startsWith("/projects/planning-poker/")) {
      return "Planning poker";
    }

    switch (pathname) {
      case "/":
        return "Login";
      case "/home":
        return "Home";
      case "/add-project":
        return "Add Project";
      case "/user-profile":
        return "User Profile";
      case "/add-user":
        return "Add User";
      case "/users":
        return "Users";
      case "/user-profile/edit":
        return "Edit profile";
      default:
        return "SMRPO";
    }
  };

  const title = getTitle(location.pathname);

  const lastLogin = localStorage.getItem("lastLogin");
  const lastLoginDate =
    lastLogin == "First login"
      ? lastLogin
      : new Date(lastLogin).toLocaleString();

  return (
    <header>
      <h1>
        SMRPO {location.pathname !== "/" && ` - Last Login: ${lastLoginDate}`}
      </h1>
      <h1>{title}</h1>
    </header>
  );
};

export default Header;
