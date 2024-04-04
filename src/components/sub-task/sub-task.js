import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addData } from "../../db/realtimeDatabase";
import "./sub-task.css";

const SubTask = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    responsible_user_id: "",
    user_story_id: "",
    projected_time: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = {
      ...formData,
      accepted: false,
      finished: false,
    };

    try {
      await addData("/tasks", taskData);
      alert("Task added successfully");
      navigate("/sub-task");
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task");
    }
  };

  return (
    <div className="container">
      <div className="content">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Task Name"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            required
          />
          <input
            type="text"
            name="responsible_user_id"
            value={formData.responsible_user_id}
            onChange={handleChange}
            placeholder="Responsible User ID"
            required
          />
          <input
            type="text"
            name="user_story_id"
            value={formData.user_story_id}
            onChange={handleChange}
            placeholder="User Story ID"
            required
          />
          <input
            type="number"
            name="projected_time"
            value={formData.projected_time}
            onChange={handleChange}
            placeholder="Projected Time (in hours)"
            required
          />
          <button type="submit">Add Task</button>
        </form>
      </div>
    </div>
  );
};

export default SubTask;
