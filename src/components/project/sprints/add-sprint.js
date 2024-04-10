import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AddSprint = () => {

    const navigate = useNavigate();
    const { projectId } = useParams();
    const [projectSprints, setProjectSprints] = useState([]);
    const [formData, setFormData] = useState({
        sprintName: "",
        projectId: projectId,
        startTime: "",
        endTime: "",
        velocity: ""
      });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e) => {
        // Format the project data to be sent to the server
        e.preventDefault();
        //Checkers
        const startTime = new Date(formData.startTime);
        const endTime = new Date(formData.endTime);
        const currentTime = new Date();

        const vel = Number(formData.velocity);

        console.log(startTime.getDay());

        if (startTime.getDay() == 6 || startTime.getDay() == 0){
          alert("Start date must be a weekday!")
          return;
        }

        if (endTime.getDay() == 6 || endTime.getDay() == 0){
          alert("End date must be a weekday!")
          return;
        }

        if (startTime > endTime){
          alert("Start date cannot be before end date!")
          return;
        }

        if (startTime < currentTime){
          alert("Start date cannot be before the current date!")
          return;
        }

        if (isNaN(formData.velocity) || (vel < 0) || (vel > 1000)){
          alert("The velocity should be a positive number (0 - 999)!")
          return;
        }

        const sprintData = {
            sprintName: formData.sprintName,
            projectId: formData.projectId,
            startTime: formData.startTime,
            endTime: formData.endTime,
            velocity: formData.velocity
        };

        // Send the project data to the server
        try {
            const response = await fetch("http://localhost:3001/api/projects/createSprint", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(sprintData),
            });
        
            if (response.ok) {
            const data = await response.json();
            alert("Sprint added successfully");
            navigate(`/projects/listSprints/${projectId}`)
            // Optionally reset form here or navigate to another page
            } else {
            const errorData = await response.json();
            alert("Failed to add sprint: " + errorData.error);
            }
        } catch (error) {
            console.error("Error submitting sprint:", error);
            alert("An error occurred. Please try again.");
        }

    }
        
    return (
      <div className="container">
        <div className="content">
          <h2>Add Sprint</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Sprint Name:
              <input
                type="text"
                id="sprintName"
                name="sprintName"
                value={formData.sprintName}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Start Time:
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              End Time:
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Sprint velocity:
              <input
                type="number-input"
                name="velocity"
                value={formData.velocity}
                onChange={handleChange}
                required
              />
            </label>
            <button type="submit">Add Sprint</button>
          </form>
        </div>
      </div>
      );
}

export default AddSprint;