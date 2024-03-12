import React, { useState, useEffect } from "react";
import { getData } from "../../db/realtimeDatabase";
import "./home.css";

const Login = () => {
  const [users, setUsers] = useState([]);

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

  return (
    <div className="home">
      <h1>Home</h1>
    </div>
  );
};

export default Login;
