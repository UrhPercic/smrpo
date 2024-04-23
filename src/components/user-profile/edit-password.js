import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getData, updateData } from "../../db/realtimeDatabase";
import bcrypt from "bcryptjs";

const EditPassword = () => {
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const userData = await getData(`/users/${userId}`);
        setUsername(userData.username);
      } catch (error) {
        console.error("Error fetching user details:", error);
        navigate("/");
      }
    };

    fetchUserDetails();
  }, [userId, navigate]);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      passwords.newPassword.length < 12 ||
      !/[A-Z]/.test(passwords.newPassword) ||
      !/[a-z]/.test(passwords.newPassword) ||
      !/[0-9]/.test(passwords.newPassword) ||
      !/[!@#$%^&*]/.test(passwords.newPassword)
    ) {
      alert(
        "New password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    const userData = await getData(`/users/${userId}`);
    if (!bcrypt.compareSync(passwords.oldPassword, userData.hashed_password)) {
      alert("Old password is incorrect.");
      return;
    }

    const updatedData = {
      hashed_password: bcrypt.hashSync(passwords.newPassword, 10),
    };
    await updateData(`/users/${userId}`, updatedData);
    alert("Password updated successfully!");
    navigate(`/user-profile`, { state: { userId } });
  };

  return (
    <div className="container">
      <div className="content">
        <h1>Edit Password - {username}</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            name="oldPassword"
            required
            placeholder="Old password"
            onChange={handleChange}
          />
          <input
            type="password"
            name="newPassword"
            required
            placeholder="New password"
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            required
            placeholder="Confirm new password"
            onChange={handleChange}
          />
          <button type="submit" className="default-button">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPassword;
