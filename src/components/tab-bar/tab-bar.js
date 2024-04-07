import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getData } from "../../db/realtimeDatabase";
import "./tab-bar.css";

const TabBar = () => {
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/");
    } else {
      const fetchUserDetails = async () => {
        try {
          const userData = await getData(`/users/${userId}`);
          setUserDetails(userData);
        } catch (error) {
          console.error("Error fetching user details:", error);
          localStorage.removeItem("userId");
          navigate("/");
        }
      };

      fetchUserDetails();
    }
  }, [navigate]);

  const handleNavigationClick = (path) => {
    navigate(path);
  };

  const handleLogoutClick = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) => {
    return window.location.pathname === path;
  };

  return (
    <div className="tab-bar">
      <div className="app-header">
        <button className="default-button" onClick={handleLogoutClick}>
          Logout
          <i class="fa-solid fa-door-open"></i>
        </button>
        <div>
          <button
            className={`default-button ${
              isActive("/planning-poker") ? "active-button" : ""
            }`}
            onClick={() => handleNavigationClick("/planning-poker")}
          >
            <strong>Planning poker</strong>
            <i className="fa-solid fa-diamond"></i>
          </button>
          <button
            className={`default-button ${
              isActive("/add-project") ? "active-button" : ""
            }`}
            onClick={() => handleNavigationClick("/add-project")}
          >
            <strong>Add project</strong>
            <i className="fa-solid fa-plus"></i>
          </button>
          {userDetails?.privilege === "admin" && (
            <button
              className={`default-button ${
                isActive("/add-user") ? "active-button" : ""
              }`}
              onClick={() => handleNavigationClick("/add-user")}
            >
              <strong>Add user</strong>
              <i className="fa-solid fa-plus"></i>
            </button>
          )}
          {userDetails?.privilege === "admin" && (
            <button
              className={`default-button ${
                isActive("/users") ? "active-button" : ""
              }`}
              onClick={() => handleNavigationClick("/users")}
            >
              <strong>Users</strong>
              <i className="fas fa-user"></i>
            </button>
          )}
          <button
            className={`default-button ${
              isActive("/user-profile") ? "active-button" : ""
            }`}
            onClick={() => handleNavigationClick("/user-profile")}
          >
            <strong>{userDetails?.username}</strong>
            <i className="fas fa-user"></i>
          </button>
          <button
            className={`default-button ${
              isActive("/home") ? "active-button" : ""
            }`}
            onClick={() => handleNavigationClick("/home")}
          >
            <strong>Home</strong>
            <i className="fa-solid fa-house"></i>
          </button>
        </div>
      </div>
      <hr />
    </div>
  );
};

export default TabBar;
