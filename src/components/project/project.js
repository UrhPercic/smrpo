import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getData } from "../../db/realtimeDatabase";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import AddTask from "./add-task";
import StoryTasks from "./StoryTasks"; // Import the StoryTasks component

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({ users: [] });
  const [story, setStory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      const fetchedProject = await getData(`/projects/${projectId}`);
      if (fetchedProject) {
        setProject(fetchedProject);
      }
    };

    const fetchStories = async () => {
      setIsLoading(true);
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
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch stories:", error);
          setStory([]);
          setIsLoading(false);
        });
    };

    fetchStories();
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

  const handleSprints = () => {
    navigate(`/projects/listSprints/${projectId}`);
  };

  const handleDiagram = () => {
    navigate(`/projects/diagram/${projectId}`);
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const storyDragged = story.find((s) => s.id === draggableId);
    if (!storyDragged) return;

    const updatedStory = { ...storyDragged, status: destination.droppableId };

    // Placeholder logic for updating story in backend
    console.log("Updating story in backend:", updatedStory);

    const newStories = story.filter((s) => s.id !== draggableId);
    newStories.splice(destination.index, 0, updatedStory);
    setStory(newStories);
    console.log(
      `Item ${draggableId} moved from ${source.droppableId} to ${destination.droppableId}`
    );
  };

  const handleAddTask = (selectedStory) => {
    setSelectedStory(selectedStory);
    setShowAddTaskForm(true);
  };

  const handleCardClick = (storyItem) => {
    console.log("Card clicked:", storyItem);
  };

  const handleViewStory = (storyItem) => {
    // Navigate to the StoryTasks component with the story ID as a route parameter
    navigate(`/projects/${projectId}/story-tasks/${storyItem.id}`);
  };

  const toggleAddTaskForm = () => {
    setShowAddTaskForm(!showAddTaskForm);
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

                      <button
                        className="add-task-button"
                        onClick={() => handleAddTask(storyItem)}
                      >
                        Add Task
                      </button>
                      <button
                        className="view-button"
                        onClick={() => handleViewStory(storyItem)}
                      >
                        View
                      </button>
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
                <button onClick={handleEdit} className="default-button">
                  Edit Project
                </button>
                <button
                  onClick={handleAddUserStory}
                  className="default-button"
                >
                  Add Story
                </button>
                <button onClick={handleSprints} className="default-button">
                  Sprints
                </button>
                <button onClick={handleDiagram} className="default-button">
                  Diagram
                </button>
                <button onClick={handleAddSprint} className="default-button">
                  Add Sprint
                </button>
              </div>
            </div>
            <p className="preserve-whitespace">
              Description: {project.description}
            </p>

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
      {/* Conditionally render the AddTask component within a popup */}
      {showAddTaskForm && (
        <div className="popup-container">
          <div className="popup">
            <span className="close" onClick={toggleAddTaskForm}>
              &times;
            </span>
            <AddTask projectId={projectId} story={selectedStory} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;
