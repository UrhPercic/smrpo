import React, { useState, useEffect } from "react";
import { getData } from "../../db/realtimeDatabase";
import { useNavigate } from "react-router-dom";
import "./home.css";

const Home = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const fetchedProjects = await getData("/projects");
      if (fetchedProjects) {
        const projectsArray = Object.keys(fetchedProjects).map((key) => ({
          id: key,
          ...fetchedProjects[key],
        }));
        setProjects(projectsArray);
      }
    };

    fetchProjects();
  }, []);

  const openProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="container">
      <div className="content">
        <h1>Projects</h1>
        <div className="projects">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project"
              onClick={() => openProject(project.id)}
            >
              <h3>{project.name}</h3>
              <span>Created at: {project.created_at}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
