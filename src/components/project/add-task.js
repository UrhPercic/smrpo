import React, { useState, useEffect } from "react";
import { getData, addData } from "../../db/realtimeDatabase";
import { useNavigate, useParams } from "react-router-dom";
import "./project.css";

const AddTask = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleSubmit = async (event) => {};

  return (
    <div className="container">
      <div className="content">
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Username" required />
          <input
            type="text"
            name="hashed_password"
            placeholder="Password"
            required
          />
          <input type="text" name="name" placeholder="Name" required />
          <input type="text" name="surname" placeholder="Surname" required />
          <input type="text" name="email" placeholder="Email" required />
          <select>
            <option value="normal">Normal</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="default-button">
            Add task
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
