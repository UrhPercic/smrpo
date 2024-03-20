import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import { getData } from "../../db/realtimeDatabase";
import "./project.css";

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate(); // Use useNavigate hook for navigation
  const [project, setProject] = useState(null);

  const [projectSprints, setProjectSprints] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      const fetchedProject = await getData(`/projects/${projectId}`);
      if (fetchedProject) {
        setProject(fetchedProject);
      }
    };
    // Fetch available users
    const fetchSprints = async () => {
      fetch(`http://localhost:3001/api/sprints/${projectId}`)
        .then((response) => response.json())
        .then(setProjectSprints);
    }

    fetchSprints();
    fetchProject();
  }, [projectId]);

  const handleEdit = () => {
    navigate(`/projects/edit/${projectId}`);
  };

  const handleAddTask = () => {
    navigate(`/projects/add-task/${projectId}`);
  };

  const handleAddSprint = () => {
    navigate(`/projects/add-sprint/${projectId}`);
  };

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };
    return dateTime.toLocaleDateString('en-US', options);
  };

  return (
    <div className="container">
      <div className="content">
        {project && (
          <>
            <div className="project-header">
              <h1>{project.name}</h1>
              <div>
                <button onClick={handleEdit} className="default-button">
                  Edit Project
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onClick={handleAddTask} className="default-button">
                  Add task
                  <i class="fa-solid fa-list-check"></i>
                </button>
                <button onClick={handleAddSprint} className="default-button">
                  Add Sprint
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
            <p>Description: {project.description}</p>
            {/* Display fetched sprints as a list */}
            <div className="sprints-list">
              <h2>Sprints:</h2>
              {projectSprints.map(sprint => {
                const startDateTime = new Date(sprint.startTime);
                const endDateTime = new Date(sprint.endTime);
                const currentDateTime = new Date();
                const isActive = currentDateTime >= startDateTime && currentDateTime <= endDateTime;

                const sprintSectionStyle = {
                  border: isActive ? '2px solid green' : '2px solid #ccc',
                  borderRadius: '5px',
                  padding: '10px',
                  marginBottom: '10px'
                };
                
                // Calculate progress percentage
                const totalTime = endDateTime - startDateTime;
                const elapsedTime = currentDateTime - startDateTime;
                const progress = isActive ? (elapsedTime / totalTime) * 100 : 0;
                
                

                return(
                  <div key={sprint.id} style={sprintSectionStyle} className="sprint-section">
                  <h3>{sprint.sprintName}</h3>
                  <p>Start Time: {formatDateTime(sprint.startTime)}</p>
                  <p>End Time: {formatDateTime(sprint.endTime)}</p>
                  <p>Velocity: {sprint.velocity}</p>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="edit-sprint-button">
                    <Link to={`/projects/edit-sprint/${sprint.id}`}>Edit Sprint</Link>
                  </div>
                </div>
                
                )
              }
            )}
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Project;
