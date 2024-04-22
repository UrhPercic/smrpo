import React, { useState } from "react";
import { addData } from "../../db/realtimeDatabase";
import { useNavigate } from "react-router-dom";

const AddTask = ({ projectId, story }) => {
  const navigate = useNavigate();
  const [taskData, setTaskData] = useState({
    name: "",
    description: "",
    projected_time: 0,
    user_story_id: story ? story.id : "",
    StartTime: null, // Initialize StartTime and FinishTime
    FinishTime: null,
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // If the task is added to the "Assigned" column, record StartTime
      const currentDateTime = new Date().toISOString();
      const updatedTaskData = {
        ...taskData,
        created_at: currentDateTime,
        StartTime: taskData.status === "Assigned" ? currentDateTime : null,
      };

      await addData(`/tasks`, updatedTaskData);
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Remaining JSX for the form
};

export default AddTask;
