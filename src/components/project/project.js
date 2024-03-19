import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getData } from "../../db/realtimeDatabase";
import "./project.css";

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate(); // Use useNavigate hook for navigation
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      const fetchedProject = await getData(`/projects/${projectId}`);
      if (fetchedProject) {
        setProject(fetchedProject);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleEdit = () => {
    navigate(`/projects/edit/${projectId}`);
  };

  const handleAddTask = () => {
    navigate(`/projects/add-task/${projectId}`);
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
              </div>
            </div>
            <p>Description: {project.description}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Project;
