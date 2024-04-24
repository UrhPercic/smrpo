import React, {useState, useEffect, Suspense} from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import {getData} from "../../db/realtimeDatabase";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import "./sprintBacklogTab.css";
import AddTask from "./add-task";

const ProductBacklogTab = () => {
    const {projectId} = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState({users: []});
    const [story, setStory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddTaskForm, setShowAddTaskForm] = useState(false);
    const [selectedStory, setSelectedStory] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [savedItems, setSavedItems] = useState([]);
    const [userRole, setUserRole] = useState("Unknown");

    const getCurrentUserRole = (users) => {
        const userId = localStorage.getItem("userId");
        const userRolesMap = users.reduce((acc, user) => {
            const roleName = user[0];
            const userId = user.id;
            acc[userId] = roleName;
            return acc;
        }, {});
        if (userRolesMap[userId]) {
            console.log("User role found:", userRolesMap[userId]);
            return userRolesMap[userId];
        }
        return "Unknown";
    };

  useEffect(() => {
    const fetchProject = async () => {
      const fetchedProject = await getData(`/projects/${projectId}`);
      if (fetchedProject) {
        const users = Object.keys(fetchedProject.users).map((key) => ({
          id: key,
          ...fetchedProject.users[key],
        }));
        setProject({ ...fetchedProject, users }); // Merge existing properties with initialized users array
        const currentUserRole = getCurrentUserRole(users); // Pass users array to getCurrentUserRole
        setUserRole(currentUserRole);
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

    const handleEditStory = (storyId) => {
        navigate(`/projects/edit-userStory/${storyId}`);
    };

    const onDragEnd = async (result) => {
        const {source, destination, draggableId} = result;

    if (!destination) return;

        const storyDragged = story.find((s) => s.id === draggableId);
        if (!storyDragged) return;

        const updatedStory = {...storyDragged, status: destination.droppableId};

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
    const handleAddTask = (selectedStory) => {
        setSelectedStory(selectedStory);
        setShowAddTaskForm(true);
    };
    const handleCardClick = (storyItem) => {
        console.log("Card clicked:", storyItem);
    };
    const handleViewStory = (storyItem) => {
        navigate(`/projects/story-tasks/${storyItem.id}`);
    };

    const toggleAddTaskForm = () => {
        setShowAddTaskForm(!showAddTaskForm);
    };
    const handleEdit = (storyId, e) => {
        const newValue = e.target.value;
        setEditValues(prevEditValues => ({
            ...prevEditValues,
            [storyId]: newValue === "" ? "0" : newValue,
        }));
        setSavedItems(savedItems.filter(itemId => itemId !== storyId));
    };
    const handleSave = async (storyId) => {
        const newTimeEstimate = editValues[storyId];
        if (newTimeEstimate !== undefined && newTimeEstimate.trim() !== "") {
            const storyToUpdate = story.find(s => s.id === storyId);
            if (storyToUpdate) {
                const updatedStory = {...storyToUpdate, time_estimate: parseInt(newTimeEstimate, 10)};
                await updateStoryInBackend(updatedStory);
                setStory(prevStory => prevStory.map(s => s.id === storyId ? updatedStory : s));
            }
        }
        setSavedItems([...savedItems, storyId]);
    };

    const isSaved = (id) => savedItems.includes(id);

    const Column = ({title, status, stories, subColumns}) => {
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
                                            <div className="description-preview">
                                                <p>{storyItem.description}</p>
                                            </div>

                                            <div className="test">
                                                {storyItem.test.split("\n").map((line, index) => (
                                                    <p key={index}>{line}</p>
                                                ))}
                                            </div>
                                            <p>
                                                Priority: <span className="priority">{storyItem.priority}</span>
                                                Business Value: <span
                                                className="businessValue">{storyItem.businessValue}</span>
                                            </p>
                                            <p key={storyItem.id} className="time_estimate_container">
                                                Time Estimate:
                                                {userRole === 'Scrum Master' && storyItem.status === 'Unrealised' ? (
                                                    <>
                                                        <input
                                                            type="number"
                                                            className="time_estimate_input"
                                                            value={editValues[storyItem.id] || storyItem.time_estimate || "0"}
                                                            onChange={(e) => handleEdit(storyItem.id, e)}
                                                            min="0"
                                                            step="1"
                                                        />
                                                        <span className="pts_label">pts</span>
                                                        <button className="time_estimate_button"
                                                                onClick={() => handleSave(storyItem.id)}
                                                                disabled={isSaved(storyItem.id)}>
                                                            {isSaved(storyItem.id) ? "Saved" : "Save"}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span
                                                            className="time_estimate_display">{editValues[storyItem.id] || storyItem.time_estimate || "0"}</span>
                                                        <span className="pts_label">pts</span>
                                                    </>
                                                )}
                                            </p>

                      <button
                        className="add-task-button"
                        onClick={() => handleAddTask(storyItem)}
                      >
                        Add Task
                      </button>
                      {userRole !== "Unknown" &&
                        userRole !== "Project Owner" && (
                          <button
                            className="tasks-button"
                            onClick={() => handleViewStory(storyItem)}
                          >
                            Tasks
                          </button>
                        )}
                      <button
                        onClick={() => handleEditStory(storyItem.id)}
                        className="edit-story-button"
                      >
                        Edit Story
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
    <div className="stories-list">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="scrum-board-container">
          <Column
            title="Unrealised stories"
            status="Unrealised"
            stories={story}
            subColumns={[
              { title: "Unassigned", status: "Unrealised" },
              {
                title: "Assigned to current sprint",
                status: "Unrealised_Active",
              },
            ]}
          />
          <Column
            title="Realised stories"
            stories={story}
            status={"Realised"}
          />
        </div>
      </DragDropContext>
      {/* Conditionally render the AddTask component within a popup */}
      {showAddTaskForm && (
        <div className="popup-container">
          <div className="popup">
            <span className="close" onClick={toggleAddTaskForm}>
              &times;
            </span>
                        <AddTask projectId={projectId} story={selectedStory}/>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductBacklogTab;
