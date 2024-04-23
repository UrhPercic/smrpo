import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getData } from "../../db/realtimeDatabase";
import "./users.css";

const Users = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);

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
          fetchAllUsers();
        } else {
          navigate("/home");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        navigate("/");
      }
    };

    const fetchAllUsers = async () => {
      try {
        const allUsers = await getData("/users");
        if (allUsers) {
          const usersArray = Object.keys(allUsers)
            .map((key) => ({
              id: key,
              ...allUsers[key],
            }))
            .filter((user) => user.privilege !== "admin");
          setUsers(usersArray);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleUserClick = (userId) => {
    navigate("/user-profile/edit", { state: { userId } });
  };

  return isAdmin ? (
    <div className="container">
      <div className="content">
        <h1>Users</h1>
        <div className="users">
          {users.map((user) => (
            <div
              key={user.id}
              className={`user ${
                user.privilege === "Disabled" ? "disabled-user" : ""
              }`}
              onClick={() => handleUserClick(user.id)}
            >
              {user.username}
              <i className="fa-solid fa-pen-to-square"></i>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null;
};

export default Users;
