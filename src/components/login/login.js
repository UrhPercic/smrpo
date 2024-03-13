import React, { useState, useEffect } from "react";
import { getData } from "../../db/realtimeDatabase";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getData("/users");
      if (fetchedUsers) {
        setUsers(
          Object.entries(fetchedUsers).map(([key, value]) => ({
            id: key,
            ...value,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const handleLogin = () => {
    if (selectedUser) {
      localStorage.setItem("userId", selectedUser);
      navigate("/home", { state: { userId: selectedUser } });
    }
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <hr />
      <select onChange={handleSelectChange} value={selectedUser}>
        <option value="" disabled>
          Select a User
        </option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </select>
      <button
        className="default-button"
        onClick={handleLogin}
        disabled={!selectedUser}
      >
        Login
      </button>
    </div>
  );
};

export default Login;
