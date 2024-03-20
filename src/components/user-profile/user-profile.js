import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { getData } from "../../db/realtimeDatabase";
import "./user-profile.css";

const UserProfile = () => {
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




  return (
    <div className="user-profile">
      {userDetails && (
        <div className="profile-card">
          <div className="profile-header">
            <h1>Welcome, {userDetails.name}! Here is your user profile:</h1>
          </div>
          <div className="profile-body">
            <p>Name: <b>{userDetails.name}</b></p>
            <p>Surname: <b>{userDetails.surname}</b></p>
            <p>Username: <b>{userDetails.username}</b></p>
            <p>Email: <b>{userDetails.email}</b></p>
            {/* Add other user details here */}
          </div>
          <div className="profile-footer">
            <Link to="/user-profile/edit" className="edit-profile-button">
              Edit Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
