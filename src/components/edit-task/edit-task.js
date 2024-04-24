import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getData, updateData } from "../../db/realtimeDatabase";
import "./edit-task.css";

const EditTask = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [taskData, setTaskData] = useState({
    name: "",
    description: "",
    projected_time: "",
  });

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const task = await getData(`/tasks/${taskId}`);
        if (task) {
          setTaskData({
            name: task.name,
            description: task.description,
            projected_time: task.projected_time,
          });
        } else {
          console.error("Task not found");
        }
      } catch (error) {
        console.error("Error fetching task data:", error);
      }
    };

    fetchTaskData();
  }, [taskId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    console.log(taskData);
    event.preventDefault();
    try {
      await updateData(`/tasks/${taskId}`, taskData);
      alert("Task updated successfully!");
      navigate(`/home`);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <div className="container">
      <div className="content">
        <h1>Edit Task</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={taskData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={taskData.description}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="projected_time"
            placeholder="Projected Time"
            value={taskData.projected_time}
            onChange={handleChange}
            required
          />
          <button type="submit" className="default-button">
            Update Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
