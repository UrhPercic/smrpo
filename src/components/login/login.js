import React, { useState, useEffect } from "react";
import { getData, addData } from "../../db/firestore";
import "./login.css";

const Login = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getData("users");
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async () => {
    const newUser = {
      username: "admin",
      hashed_password: "admin",
      name: "admin",
      surname: "admin",
      email: "admin@admin.com",
      privilege: "admin",
      created_at: new Date(),
    };

    try {
      await addData("users", newUser);
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <select>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </select>
      <button onClick={addUser}>Add User</button>
    </div>
  );
};

export default Login;
