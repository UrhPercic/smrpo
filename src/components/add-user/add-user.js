import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getData, addData } from "../../db/realtimeDatabase";
import bcrypt from "bcryptjs";
import "./add-user.css";

const AddUser = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/");
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const userData = await getData(`/users/${userId}`);
        if (userData.privilege === "admin") {
          setIsAdmin(true);
        } else {
          navigate("/home");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        navigate("/");
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get("username");
    const password = formData.get("hashed_password");
    const repeatPassword = formData.get("repeat_password");

    if (password !== repeatPassword) {
      alert("Passwords do not match.");
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
      const existingUsers = await getData("/users");
      const isUsernameTaken = Object.values(existingUsers).some(
        (user) => user.username === username
      );

      if (isUsernameTaken) {
        alert("Username already taken. Please choose a different one.");
        return;
      }

      const newUser = {
        username: username,
        hashed_password: hashedPassword,
        name: formData.get("name"),
        surname: formData.get("surname"),
        email: formData.get("email"),
        privilege: formData.get("privilege"),
        created_at: new Date().toISOString(),
      };

      await addData("/users", newUser);
      alert("User added successfully");
      navigate("/home");
    } catch (error) {
      console.error("Error adding new user:", error);
      alert("Failed to add user");
    }
  };

  return isAdmin ? (
    <div className="container">
      <div className="content">
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Username" required />
          <input
            type="password"
            name="hashed_password"
            placeholder="Password"
            required
          />
          <input
            type="password"
            name="repeat_password"
            placeholder="Repeat password"
            required
          />
          <input type="text" name="name" placeholder="Name" required />
          <input type="text" name="surname" placeholder="Surname" required />
          <input type="email" name="email" placeholder="Email" required />

          <select>
            <option value="normal">Normal</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="default-button">
            Add User
          </button>
        </form>
      </div>
    </div>
  ) : null;
};

export default AddUser;
