import React from "react";
import { useLocation } from "react-router-dom";
import "./header.css";

const Header = () => {
  const location = useLocation();

  const getTitle = (pathname) => {
    switch (pathname) {
      case "/":
        return "Login";
      case "/home":
        return "Home";
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
