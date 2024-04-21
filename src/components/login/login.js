import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";
import { getData, updateData } from "../../db/realtimeDatabase";
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    if (username && password) {
      try {
        const users = await getData("/users");
        const userEntry = Object.entries(users).find(
          ([, value]) => value.username === username
        );

        const user = userEntry ? { id: userEntry[0], ...userEntry[1] } : null;

        if (user && bcrypt.compareSync(password, user.hashed_password)) {
          if (user.privilege === "Disabled") {
            alert("User is disabled. Login unsuccessful.");
            return;
          }

          const lastLogin = user.lastLogin || "First login";
          localStorage.setItem("lastLogin", lastLogin);

          await updateData(`/users/${user.id}`, {
            lastLogin: new Date().toISOString(),
          });

          localStorage.setItem("userId", user.id);
          navigate("/home", { state: { userId: user.id } });
        } else {
          alert("Invalid username or password");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred during login");
      }
    }
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <hr />
      <input
        type="text"
        value={username}
        onChange={handleUsernameChange}
        placeholder="Username"
        required
      />
      <input
        type="password"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Password"
        required
      />
      <button
        className="default-button"
        onClick={handleLogin}
        disabled={!username || !password}
      >
        Login
      </button>
    </div>
  );
};

export default Login;
