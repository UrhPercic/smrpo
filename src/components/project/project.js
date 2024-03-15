import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getData } from "../../db/realtimeDatabase";
import "./project.css";

const Project = () => {
  const { projectId } = useParams();
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

  const handleSubmit = async (event) => {};

  return (
    <div className="container">
      <div className="content">
        {project && (
          <>
            <h1>{project.name}</h1>
            <p>Describtion: {project.description}</p>
          </>
        )}
        <div className="add-task">
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Name" required />
            <input type="text" name="surname" placeholder="Surname" required />
            <input type="text" name="email" placeholder="Email" required />
            <button className="default-button" type="submit">
              Add task
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Project;
