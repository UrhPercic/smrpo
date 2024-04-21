import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getData } from "../../db/realtimeDatabase";
import "./project.css";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({ users: [] }); // Initialize users as an empty array
  const [story, setStory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const fetchedProject = await getData(`/projects/${projectId}`);
      if (fetchedProject) {
        console.log("Fetched project:", fetchedProject); // Log the fetched project
        setProject(fetchedProject);
      }
    };

    const fetchStories = async () => {
      setIsLoading(true); // Start loading
      fetch(
        `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/userStory.json`
      )
        .then((response) => response.json())
        .then((data) => {
          const storiesArray = Object.keys(data || {})
            .map((key) => ({
              ...data[key],
              id: key,
            }))
            .filter((story) => story.projectId === projectId);
          setStory(storiesArray);
          setIsLoading(false); // Data loaded
        })
        .catch((error) => {
          console.error("Failed to fetch stories:", error);
          setStory([]); // Fallback in case of error
          setIsLoading(false); // Data loading failed
        });
    };

    fetchStories();
    fetchProject();
  }, [projectId]);
  if (isLoading) {
    return <div>Loading stories...</div>;
  }

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


  const handleEditStory = (storyId) => {
    navigate(`/projects/edit-userStory/${storyId}`);

  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return; // dropped outside a droppable area

    const storyDragged = story.find((s) => s.id === draggableId);
    if (!storyDragged) return;

    const updatedStory = { ...storyDragged, status: destination.droppableId };

    await updateStoryInBackend(updatedStory);

    const newStories = story.filter((s) => s.id !== draggableId);
    newStories.splice(destination.index, 0, updatedStory);
    console.log("Old state:", story);
    console.log("New state:", newStories);
    setStory(newStories);
    console.log(
      `Item ${draggableId} moved from ${source.droppableId} to ${destination.droppableId}`
    );
  };

  const updateStoryInBackend = async (storyToUpdate) => {
    try {
      const response = await fetch(
        `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/userStory/${storyToUpdate.id}.json`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(storyToUpdate),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update the story.");
      }
      console.log("Story updated successfully:", storyToUpdate);
    } catch (error) {
      console.error("Error updating story:", error);
    }
  };

  const handleCardClick = (storyItem) => {
    console.log("Card clicked:", storyItem);
  };

  const Column = ({ title, status, stories, subColumns }) => {
    const renderContent = (status, stories) => (
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`sub-column-content ${
              snapshot.isDraggingOver ? "droppable-over" : ""
            }`}
          >
            {stories
              .filter((item) => item.status === status)
              .map((storyItem, index) => (
                <Draggable
                  key={storyItem.id}
                  draggableId={storyItem.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`story-section ${
                        snapshot.isDragging ? "dragging-story" : ""
                      }`}
                    >
                      <h4>{storyItem.userStoryName}</h4>
                      <p className="description-preview">
                        {storyItem.description}
                      </p>
                      <p className="test">{storyItem.test}</p>
                      <p>
                        <span className="priority">{storyItem.priority}</span>
                        <span className="businessValue">
                          {storyItem.businessValue}
                        </span>
                      </p>
                      <button onClick={() => handleEditStory(storyItem.id)} className="edit-story-button">Edit Story</button>
                    </div>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
    return (
      <div className="column">
        <h3>{title}</h3>
        {subColumns ? (
          <div className="sub-columns-container">
            {subColumns.map((subColumn) => (
              <div key={subColumn.status} className="sub-column">
                <h4>{subColumn.title}</h4>
                {renderContent(subColumn.status, stories)}
              </div>
            ))}
          </div>
        ) : (
          renderContent(status, stories)
        )}
      </div>
    );
  };

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

            <div className="stories-list">
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="scrum-board-container">
                  <Column title="Backlog" status="Backlog" stories={story} />
                  <Column
                    title="Product Backlog"
                    stories={story}
                    subColumns={[
                      { title: "Unrealized", status: "Product Backlog1" },
                      { title: "Realized", status: "Product Backlog2" },
                    ]}
                  />
                  <Column
                    title="Sprint Backlog"
                    status="Sprint Backlog"
                    stories={story}
                  />
                  <Column
                    title="In progress"
                    status="In Progress"
                    stories={story}
                  />
                  <Column title="Testing" status="Testing" stories={story} />
                  <Column title="Done" status="Done" stories={story} />
                </div>
              </DragDropContext>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Project;
