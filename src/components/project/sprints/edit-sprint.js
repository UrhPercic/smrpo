import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { updateData } from "../../../db/realtimeDatabase";
import "./edit-sprint.css";

const EditSprint = () => {

  const { projectId, sprintId } = useParams();
  const [sprints, setSprints] = useState([]);
  const [projectSprints, setProjectSprints] = useState([]);
  const [formData, setFormData] = useState({
      sprintName: "",
      startTime: "",
      endTime: "",
      velocity: "",
      isActive: ""
  });
  const navigate = useNavigate();

  var isActive = false;

  useEffect(() => {


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

    
    const fetchSprints = async () => {
        try {
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
              
              setSprints(sprintsArray);

              // Find the object with the specific ID
              const foundObject = sprintsArray.find(obj => obj.id === sprintId);
              const currentDateTime = new Date();
              const startDateTime = new Date(foundObject.startTime);
              const endDateTime = new Date(foundObject.endTime);

              isActive = currentDateTime >= startDateTime && currentDateTime <= endDateTime;
              foundObject.isActive = isActive;

              setFormData(foundObject);
              console.log(foundObject); // Log the found object

              console.log(isActive);

              //setIsLoading(false); // Data loaded
            })
            .catch((error) => console.error('Error fetching sprints:', error));
        } catch (error) {
        console.error('Error fetching sprints:', error);
        }
    };
    
    const fetchAllSprints = async () => {
        await fetch(`http://localhost:3001/api/sprints/${projectId}`)
            .then((response) => response.json())
            .then((sprints) => {
              // Filter out the sprint with the excluded sprintId
              const filteredSprints = sprints.filter((sprint) => sprint.id !== sprintId);
              // Set the filtered sprints to state
              setProjectSprints(filteredSprints);
          })
    };

    const fetchAllSprints2 = async () => {
      await fetch(
        `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/sprints.json`
      )
        .then((response) => response.json())
        .then((data) => {
            const filteredSprints = Object.keys(data || {})
                .map((key) => ({
                    ...data[key],
                    id: key,
                }))
                .filter((sprint) => sprint.projectId === projectId)
                .filter((sprint) => sprint.id !== sprintId);
            // Filter out the sprint with the excluded sprintId
            // Set the filtered sprints to state
            setProjectSprints(filteredSprints);
        })
    };



    fetchSprints();
    fetchAllSprints2();
    console.log(projectSprints);
    // Find the object with the specific ID
    
    console.log(isActive);
    console.log(sprints);
    console.log(sprintId);
    //console.log(foundObject);
    
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log(formData);

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    const currentTime = new Date();

    const vel = Number(formData.velocity);
    console.log(isActive);

    if(!formData.isActive){
      if (startTime > endTime){
          alert("Start date cannot be before end date!")
          return;
      }

      if (startTime < currentTime){
          alert("Start date cannot be before the current date!")
          return;
      }

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

    const updateDataSet = {
        sprintId: sprintId,
        sprintName: formData.sprintName,
        startTime: formData.startTime,
        endTime: formData.endTime,
        velocity: formData.velocity,
    };


    // Send the project data to the server1
    try {

        await updateData(`/sprints/${sprintId}`, updateDataSet);
        alert("Sprint updated successfully");
        navigate(`/projects/listSprints/${projectId}`)
        /*const response = await fetch("http://localhost:3001/api/sprints/updateData", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
        });
    
        if (response.ok) {
        const data = await response.json();
        alert("Sprint updated successfully");
        navigate(`/home`)
        // Optionally reset form here or navigate to another page
        } else {
        const errorData = await response.json();
        alert("Failed to update sprint: " + errorData.error);
        }*/
    } catch (error) {
        console.error("Error submitting update to sprint:", error);
        alert("An error occurred. Please try again.");
    }

    
  };
  return (
    <div className="edit-sprint">
      <h1>Edit Sprint</h1>
      {sprints && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Sprint name:</label>
            <input
              disabled = {formData.isActive}
              type="text"
              name="sprintName"
              value={formData.sprintName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Start time:</label>
            <input
              disabled = {formData.isActive}
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>End time:</label>
            <input
              disabled = {formData.isActive}
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Velocity:</label>
            <input
              type="number-input"
              name="velocity"
              value={formData.velocity}
              onChange={handleChange}
            />
          </div>
          {/* Add more form fields for other user details */}
          <button type="submit" className="update-profile-button">
            Update
          </button>
          <Link to={`/projects/listSprints/${projectId}`} className="cancel-button">
            Cancel
          </Link>
        </form>
      )}
    </div>
  );
};

export default EditSprint;
