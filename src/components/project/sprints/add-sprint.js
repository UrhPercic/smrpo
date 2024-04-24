import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addData } from "../../../db/realtimeDatabase";


const AddSprint = () => {

    const navigate = useNavigate();
    const { projectId } = useParams();
    const [projectSprints, setProjectSprints] = useState([]);
    const [formData, setFormData] = useState({
        sprintName: "",
        projectId: projectId,
        startTime: "",
        endTime: "",
        velocity: "",
        storiesHandled: false,
      });

    
    
    useEffect(() => {
      const fetchSprints = async () => {
          //setIsLoading(true); // Start loading
          fetch(
              `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/sprints.json`
          )
              .then((response) => response.json())
              .then((data) => {
                  const sprintsArray = Object.keys(data || {})
                      .map((key) => ({
                          ...data[key],
                          id: key,
                      }))
                      .filter((sprint) => sprint.projectId === projectId);
                  setProjectSprints(sprintsArray);
                  //setIsLoading(false); // Data loaded
              })
              .catch((error) => {
                  console.error("Failed to fetch sprints:", error);
                  setProjectSprints([]); // Fallback in case of error
                  //setIsLoading(false); // Data loading failed
              });
      };
      fetchSprints();
      console.log(projectSprints);
    }, [formData]);

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

         // Check for overlapping sprints
        const hasOverlap = projectSprints.some(sprint => {
          const sprintStart = new Date(sprint.startTime);
          const sprintEnd = new Date(sprint.endTime);
          const newSprintStart = new Date(startTime);
          const newSprintEnd = new Date(endTime);

          // Check if the new sprint overlaps with any existing sprint
          return (newSprintStart >= sprintStart && newSprintStart <= sprintEnd) ||
                (newSprintEnd >= sprintStart && newSprintEnd <= sprintEnd) ||
                (newSprintStart <= sprintStart && newSprintEnd >= sprintEnd);
        });

        if (hasOverlap){
          alert("There is already a sprint existing in the selected time period!")
          return;
        }
        
        
        const sprintData = {
            sprintName: formData.sprintName,
            projectId: formData.projectId,
            startTime: formData.startTime,
            endTime: formData.endTime,
            velocity: formData.velocity,
            storiesHandled: false
        };

        // Send the project data to the server
        try {

            await addData(`/sprints`, sprintData);
        /*
            const response = await fetch("http://localhost:3001/api/projects/createSprint", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(sprintData),
            });
        */
            alert("Sprint added successfully");
            navigate(`/projects/listSprints/${projectId}`)
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