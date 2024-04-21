import React, { useState, useEffect, Suspense } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getData } from "../../db/realtimeDatabase";
import "./project.css";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import sprintBacklogTab from "./sprintBacklogTab.js";
import productBacklogTab from "./productBacklogTab.js";

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({ users: [] }); // Initialize users as an empty array
  const [activeTab, setActiveTab] = useState('product_backlog');
  const [projectSprints, setProjectSprints] = useState([]);


  useEffect(() => {
    const fetchProject = async () => {
      const fetchedProject = await getData(`/projects/${projectId}`);
      if (fetchedProject) {
      console.log("Fetched project:", fetchedProject); // Log the fetched project
      setProject(fetchedProject);
      }
    };

    const fetchSprints = async () => {
      await fetch(`http://localhost:3001/api/sprints/${projectId}`)
          .then((response) => response.json())
          .then((sprints) => {
            const currentDateTime = new Date(); // Get the current date and time
            const activeSprints = sprints.filter((sprint) => {
                const startDateTime = new Date(sprint.startTime);
                const endDateTime = new Date(sprint.endTime);
                return currentDateTime >= startDateTime && currentDateTime <= endDateTime;
            });
            setProjectSprints(activeSprints);
        });
    };

    fetchProject();
    fetchSprints();

  }, [projectId])


  const handleEdit = () => {
    navigate(`/projects/edit/${projectId}`);
  };
  const handleAddUserStory = () => {
    navigate(`/projects/add-userStory/${projectId}`);
  };
  const handleSprints = () => {
    navigate(`/projects/listSprints/${projectId}`);
  };
  const handleDiagram = () => {
    navigate(`/projects/diagram/${projectId}`);
  };
  const handleWall = () => {
    navigate(`/projects/wall/${projectId}`);
  };

  const handlePlanningPokerClick = () => {
    navigate(`/projects/planning-poker/${projectId}`);
  };


  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const renderTabComponent = (tab) => {
    switch (tab) {
        case 'product_backlog':
            return productBacklogTab;
        case 'sprint_backlog':
            console.log("sprint_backlog");
            return sprintBacklogTab;
        default:
            return null;
    }
  };
  

  
  const TabComponent = renderTabComponent(activeTab);
  return (
    <div className="cons">
      <div className="cont">
        {project && (
          <>
            <div className="project-header">
              <h1>{project.name}</h1>
              <div>
                <button
                  className="default-button"
                  onClick={handlePlanningPokerClick}
                >
                  <strong>Planning poker</strong>
                  <i className="fa-solid fa-diamond"></i>
                </button>
                <button onClick={handleWall} className="default-button">
                  Wall
                </button>
                <button onClick={handleEdit} className="default-button">
                  Edit Project
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onClick={handleAddUserStory} className="default-button">
                  Add Story
                  <i className="fa-solid fa-book"></i>
                </button>
                <button onClick={handleSprints} className="default-button">
                  Sprints
                  <i class="fa-solid fa-person-running"></i>
                </button>
                <button onClick={handleDiagram} className="default-button">
                  Diagram
                  <i class="fa-solid fa-chart-simple"></i>
                </button>
              </div>
            </div>
            <p className="preserve-whitespace">
              Description: {project.description}
            </p>
            {/* ADD USERS */}
            <p className="current-sprint">
                    Active sprint: 

                    {projectSprints.length == 0 && (
                        <>
                            <span> </span>
                            <span><b>There is no active sprint.</b></span>
                        </>
                    )}
                    {projectSprints.length > 0 && (
                        <>
                            <span> </span>
                            <span><b>{projectSprints[0].sprintName}</b></span>
                            <span> - </span>
                            <span>{new Date(projectSprints[0].startTime).toLocaleString()}</span>
                            <span> to </span>
                            <span>{new Date(projectSprints[0].endTime).toLocaleString()}</span>
                        </>
                    )}
              </p>
            <div>
              <div className="tabs">
                  <button className={activeTab === 'product_backlog' ? 'active' : ''} onClick={() => handleTabClick('product_backlog')}>Product Backlog</button>
                  <button className={activeTab === 'sprint_backlog' ? 'active' : ''} onClick={() => handleTabClick('sprint_backlog')}>Sprint Backlog</button>
              </div>
              <div className="tab-content">
                <Suspense fallback={<div>Loading...</div>}>
                    {TabComponent && <TabComponent />}
                </Suspense>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Project;
