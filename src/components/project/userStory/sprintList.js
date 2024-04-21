import React, {useState, useEffect} from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import {getData} from "../../../db/realtimeDatabase";
import "./sprintList.css";

const Sprints = () => {
    const {projectId} = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState({users: []}); // Initialize users as an empty array
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
            fetch(`http://localhost:3001/api/sprints/${projectId}`)
                .then((response) => response.json())
                .then(setProjectSprints);
        };

        fetchSprints();
        fetchProject();
    }, [projectId]);

    const handleEdit = () => {
        navigate(`/projects/edit/${projectId}`);
    };

    const handleAddSprint = () => {
        navigate(`/projects/add-sprint/${projectId}`);
    };
    const handleAddUserStory = () => {
        navigate(`/projects/add-userStory/${projectId}`);
    };

    async function deleteSprint(sprintId){
        // Your deletion logic here
        // Initialize Firebase Admin SDK
        console.log(sprintId)
        const sendData = {
            sprintId: sprintId
        };

        // Send the project data to the server1
        try {
            const response = await fetch("http://localhost:3001/api/sprints/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(sendData),
            });
        
            if (response.ok) {
            const data = await response.json();
            alert("Sprint removed successfully");
            navigate(`/home`)
            // Optionally reset form here or navigate to another page
            } else {
            const errorData = await response.json();
            alert("Failed to remove sprint: " + errorData.error);
            }
        } catch (error) {
            console.error("Error removing sprint:", error);
            alert("An error occurred. Please try again.");
        }


        console.log("Sprint deleted + ", sprintId);
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
                                <button onClick={handleAddUserStory} className="default-button">
                                    Add Story
                                    <i className="fa-solid fa-book"></i>
                                </button>
                                <button onClick={handleAddSprint} className="default-button">
                                    Add Sprint
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <p className="preserve-whitespace">Description: {project.description}</p>
                        {/* ADD USERS */}


                        {/* Display fetched sprints as a list */}
                        <div className="sprints-list">
              <h2>Sprints:</h2>
              {projectSprints
              .slice() // Create a copy of the array to avoid mutating the original
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
              .map(sprint => {
                const startDateTime = new Date(sprint.startTime);
                const endDateTime = new Date(sprint.endTime);
                const currentDateTime = new Date();
                const isActive = currentDateTime >= startDateTime && currentDateTime <= endDateTime;
                const isFinished = currentDateTime >= endDateTime;
                
                const sprintSectionStyle = {
                  border: isActive ? '2px solid #3498db' : '2px solid #ccc',
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
                  {isActive && <div className="active-indicator">Active</div>}
                  {isFinished && <div className="finished-indicator">Finished</div>}
                  <h3>{sprint.sprintName}</h3>
                  <p>Start Time: {formatDateTime(sprint.startTime)}</p>
                  <p>End Time: {formatDateTime(sprint.endTime)}</p>
                  <p>Velocity: {sprint.velocity} pts</p>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                  </div>
                  {!isFinished && <div className="edit-sprint-button">
                    <Link to={`/projects/edit-sprint/${projectId}/${sprint.id}`}>Edit Sprint</Link>
                  </div>}
                  {!isFinished && !isActive && 
                    (<div className="delete-sprint-button" onClick={() => deleteSprint(sprint.id)}>
                        Delete Sprint
                    </div>)}
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

export default Sprints;
