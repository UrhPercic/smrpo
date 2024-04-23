import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { getData, updateData } from "../../db/realtimeDatabase";
import "./edit-profile.css";

const EditProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    privilege: "Normal",
  });
  const [users, setUsers] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();
  const location = useLocation();

  useEffect(() => {
    const userId =
      paramUserId || location.state?.userId || localStorage.getItem("userId");
    if (!userId) {
      navigate("/");
      return;
    }

    async function fetchData() {
      try {
        const userData = await getData(`/users/${userId}`);
        const allUsers = await getData("/users");
        const usersArray = Object.values(allUsers || {}).map((user, index) => ({
          id: Object.keys(allUsers)[index],
          ...user,
        }));

        setUsers(usersArray);

        setIsDisabled(userData.privilege === "Disabled");

        setUserDetails({ ...userData, id: userId });
        setFormData(userData);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/");
      }
    }

    fetchData();
  }, [navigate, paramUserId, location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleToggleDisable = (e) => {
    e.preventDefault();
    const newIsDisabled = !isDisabled;
    setIsDisabled(newIsDisabled);
    setFormData({
      ...formData,
      privilege: newIsDisabled ? "Disabled" : "Normal",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usernameExists = users.some(
      (user) =>
        user.username === formData.username && user.id !== userDetails.id
    );
    if (usernameExists) {
      alert("Username already exists. Please choose a different one.");
      return;
    }

    const updatedData = {
      ...formData,
      privilege: formData.privilege,
    };

    try {
      await updateData(`/users/${userDetails.id}`, updatedData);
      alert("User profile updated successfully!");
      navigate(`/user-profile`);
    } catch (error) {
      console.error("Failed to update user information:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleEditPassword = () => {
    navigate(`/edit-password`, {
      state: { userId: userDetails.id },
    });
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
          <div className="form-group">
            <label>Privilege:</label>
            <select
              name="privilege"
              value={formData.privilege}
              onChange={handleChange}
              disabled={isDisabled}
            >
              <option value="Normal">Normal</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {location.state?.userId && (
            <button
              type="button"
              onClick={handleToggleDisable}
              className={`disable ${
                isDisabled ? "default-button" : "red-button"
              }`}
            >
              {isDisabled ? "Enable User" : "Disable User"}
            </button>
          )}
          <div className="buttons">
            <button type="submit" className="default-button">
              Update
            </button>
            <button
              type="button"
              onClick={handleEditPassword}
              className="default-button"
            >
              Edit Password
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditProfile;
