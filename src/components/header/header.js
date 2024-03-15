import React from "react";
import { useLocation } from "react-router-dom";
import "./header.css";

const Header = () => {
  const location = useLocation();

  const getTitle = (pathname) => {
    if (pathname.startsWith("/project/")) {
      return "Project";
    }
    switch (pathname) {
      case "/":
        return "Login";
      case "/home":
        return "Home";
      case "/add-project":
        return "Add project";
      case "/user-profile":
        return "User profile";
      case "/add-user":
        return "Add user";
      case "/planning-poker":
        return "Planning poker";
      default:
        return "SMRPO";
    }
  };

  const title = getTitle(location.pathname);

  return (
    <header>
      <h1>SMRPO</h1>
      <h1>{title}</h1>
    </header>
  );
};

export default Header;
