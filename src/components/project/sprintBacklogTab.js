import React, { useState, useEffect, Suspense } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getData } from "../../db/realtimeDatabase";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import "./sprintBacklogTab.css";


const SprintBacklogTab = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState({ users: [] }); // Initialize users as an empty array
    //const [story, setStory] = useState([]);
    const [task, setTask] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            const fetchedProject = await getData(`/projects/${projectId}`);
            if (fetchedProject) {
            console.log("Fetched project:", fetchedProject); // Log the fetched project
            setProject(fetchedProject);
            }
        };

        const fetchTasks = async () => {

            var storiesArray = [];
            setIsLoading(true); // Start loading
            await fetch(
            `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/userStory.json`
            )
            .then((response) => response.json())
            .then((data) => {
                storiesArray = Object.keys(data || {})
                .map((key) => ({
                    ...data[key],
                    id: key,
                }))
                .filter((story) => story.projectId === projectId)
                .filter((story) => story.status === "Realised_Assigned");
                console.log(storiesArray);
                //setStory(storiesArray);
                setIsLoading(false); // Data loaded
            })
            .catch((error) => {
                console.error("Failed to fetch stories:", error);
                //setStory([]); // Fallback in case of error
                setIsLoading(false); // Data loading failed
            });

            await fetch(
                `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/tasks.json`
                )
                .then((response) => response.json())
                .then((data) => {
                    const taskArray = Object.keys(data || {})
                    .map((key) => ({
                        ...data[key],
                        id: key,
                    }))
                    .filter((task) => {
                        return storiesArray.some(story => story.id === task.user_story_id);
                    });
                    
                    console.log(taskArray)
                    setTask(taskArray);
                    setIsLoading(false); // Data loaded
                })
                .catch((error) => {
                    console.error("Failed to fetch stories:", error);
                    setTask([]); // Fallback in case of error
                    setIsLoading(false); // Data loading failed
                });

        };

        fetchProject();
        fetchTasks();

        //console.log(project);
        //console.log(story);
        //console.log(task);
        
    }, []);
    
    if (isLoading) {
        return <div>Loading tasks...</div>;
    }

    const handleEditStory = (storyId) => {
        navigate(`/projects/edit-userStory/${storyId}`);
    
    };

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return; // dropped outside a droppable area

        const taskDragged = task.find((s) => s.id === draggableId);
        if (!taskDragged) return;

        const updatedTask = { ...taskDragged, status: destination.droppableId };

        await updateStoryInBackend(updatedTask);

        const newTasks = task.filter((s) => s.id !== draggableId);
        newTasks.splice(destination.index, 0, updatedTask);
        console.log("Old state:", task);
        console.log("New state:", newTasks);
        setTask(newTasks);
        console.log(
            `Item ${draggableId} moved from ${source.droppableId} to ${destination.droppableId}`
        );
    };

    const updateStoryInBackend = async (taskToUpdate) => {
        try {
            const response = await fetch(
            `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskToUpdate.id}.json`,
            {
                method: "PUT",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(taskToUpdate),
            }
            );

            if (!response.ok) {
            throw new Error("Failed to update the task.");
            }
            console.log("Task updated successfully:", taskToUpdate);
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleCardClick = (taskItem) => {
        console.log("Card clicked:", taskItem);
    };

    const Column = ({ title, status, tasks, subColumns }) => {
        const renderContent = (status, tasks) => (
            <Droppable droppableId={status}>
            {(provided, snapshot) => (
                <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`sub-column-content ${
                    snapshot.isDraggingOver ? "droppable-over" : ""
                }`}
                >
                {tasks
                    .filter((item) => item.status === status)
                    .map((taskItem, index) => (
                    <Draggable
                        key={taskItem.id}
                        draggableId={taskItem.id}
                        index={index}
                    >
                        {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-section ${
                            snapshot.isDragging ? "dragging-task" : ""
                            }`}
                        >
                            <h4>{taskItem.name}</h4>
                            <p className="description-preview">
                            {taskItem.description}
                            </p>
                            <p className="assigned-to">Assigned to: {taskItem.assignedTo}</p>
                            <p className="time-estimate">Time estimate: {taskItem.projected_time}</p>
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
                {renderContent(subColumn.status, tasks)}
                </div>
            ))}
            </div>
        ) : (
            renderContent(status, tasks)
        )}
        </div>
    );
    };


    return (
        <div className="tasks-list">
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="scrum-board-container">
                  <Column 
                    title="Unassigned"
                    status="Unassigned"
                    tasks={task}
                  />
                  <Column
                    title="Assigned"
                    status="Assigned"
                    tasks={task}
                  />
                  <Column
                    title="Active"
                    status="Active"
                    tasks={task}
                  />
                  <Column
                    title="Finished"
                    status="Finished"
                    tasks={task}
                  />
                </div>
              </DragDropContext>
            </div>
    );
};

export default SprintBacklogTab;
