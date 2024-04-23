import React, { useState, useEffect } from "react";
import { addData } from "../../db/realtimeDatabase";
import { useNavigate, useParams } from "react-router-dom";
import "./project.css";
import StoryTasks from "./userStory-tasks/StoryTasks";

const AddTask = ({ projectId, story }) => {
  const navigate = useNavigate();
  const [taskData, setTaskData] = useState({
    name: "",
    description: "",
    projected_time: 0, // Change to integer type
    user_story_id: story ? story.id : "",
    created_at: "",
  });

  useEffect(() => {
    const currentDateTime = new Date().toISOString();
    setTaskData((prevData) => ({
      ...prevData,
      created_at: currentDateTime,
    }));
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await addData(`/tasks`, taskData);
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("woops:", error);
    }
  };

  return (
    <div className="container">
      <div className="content">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              name="name"
              id="name"
              value={taskData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              name="description"
              id="description"
              value={taskData.description}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="projected_time">Projected Time (hours):</label>
            <input
              type="number" // Change input type to number
              name="projected_time"
              id="projected_time"
              value={taskData.projected_time}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="user_story_id">User Story ID:</label>
            <input
              type="text"
              name="user_story_id"
              id="user_story_id"
              value={taskData.user_story_id}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="default-button">
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
