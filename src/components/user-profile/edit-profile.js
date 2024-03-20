import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getData, updateData } from "../../db/realtimeDatabase";
import "./edit-profile.css";

const EditProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    // Add more fields as needed
  });
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
          setFormData(userData); // Populate form data with user details
        } catch (error) {
          console.error("Error fetching user details:", error);
          localStorage.removeItem("userId");
          navigate("/");
        }
      };

      fetchUserDetails();
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const updateData = {
        userID: localStorage.getItem("userId"),
        name: formData.name,
        surname: formData.surname,
        username: formData.username,
        email: formData.email,
    };

    try {
        const response = await fetch("http://localhost:3001/api/users/updateData", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
        });
    
        if (response.ok) {
        const data = await response.json();
        alert("User profile updated successfully!");
        navigate(`/user-profile`)
        // Optionally reset form here or navigate to another page
        } else {
        const errorData = await response.json();
        alert("Failed to update user info: " + errorData.error);
        }
    } catch (error) {
        console.error("Failed to update user information:", error);
        alert("An error occurred. Please try again.");
    }

  };

  return (
    <div className="edit-profile">
      <h1>Edit Profile</h1>
      {userDetails && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Surname:</label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {/* Add more form fields for other user details */}
          <button type="submit" className="update-profile-button">
            Update
          </button>
          <Link to="/user-profile" className="cancel-button">
            Cancel
          </Link>
        </form>
      )}
    </div>
  );
};

export default EditProfile;
