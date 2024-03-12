import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getData } from "../../db/realtimeDatabase";
import "./home.css";

const Home = () => {
  const location = useLocation();
  const userId = location.state?.userId;
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userId) {
        try {
          const userData = await getData(`/users/${userId}`);
          setUserDetails(userData);
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
    };

    fetchUserDetails();
  }, [userId]);

  return (
    <div className="home">
      <div className="app-header">
        {userDetails && (
          <>
            {userDetails.privilege === "admin" && (
              <button className="default-button">
                <strong>Add user</strong>
                <i class="fa-solid fa-plus"></i>
              </button>
            )}
            <button className="default-button">
              <strong>{userDetails.username} </strong>
              <i className="fas fa-user"></i>
            </button>
          </>
        )}
      </div>
      <hr />
    </div>
  );
};

export default Home;
