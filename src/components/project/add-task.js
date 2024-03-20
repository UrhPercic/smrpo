import React, { useState, useEffect } from "react";
import { addData } from "../../db/realtimeDatabase";
import { useNavigate, useParams } from "react-router-dom";
import "./project.css";

const AddTask = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [taskData, setTaskData] = useState({
    name: "",
    description: "", 
    projected_time: "", //predviden cas, user inputs?
    user_story_id: "", //ni se u bzis kip
    created_at: "", //local tim
  });

  
  const currentUserId = localStorage.getItem("userId");

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
          {}
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
            <label htmlFor="projected_time">Projected Time:</label>
            <input
              type="datetime-local"
              name="projected_time"
              id="projected_time"
              value={taskData.projected_time}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="user_story_id">User Story ID, ker ga se ni u bazi lol:</label>
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
