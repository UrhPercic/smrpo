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

  // Navigate to the edit project page
  const handleEdit = () => {
    navigate(`/projects/edit/${projectId}`); // Use navigate function for routing
  };

  return (
    <div className="container">
      <div className="content">
        {project && (
          <>
            <h1>{project.name}</h1>
            <p>Description: {project.description}</p>
            <button onClick={handleEdit} className="default-button">Edit Project</button> {/* Edit button */}
          </>
        )}
      </div>
    </div>
  );
};

export default Project;
