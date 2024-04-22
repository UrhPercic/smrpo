import React, { useState, useEffect } from "react";
import { getData } from "../../db/realtimeDatabase";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useParams, useNavigate } from "react-router-dom";
import "./sprintBacklogTab.css";

const SprintBacklogTab = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({ users: [] });
  const [task, setTask] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const fetchedProject = await getData(`/projects/${projectId}`);
      if (fetchedProject) {
        console.log("Fetched project:", fetchedProject);
        setProject(fetchedProject);
      }
    };

    const fetchTasks = async () => {
      var storiesArray = [];
      setIsLoading(true);
      try {
        const storyResponse = await fetch(
          `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/userStory.json`
        );
        const storyData = await storyResponse.json();
        storiesArray = Object.keys(storyData || {})
          .map((key) => ({ ...storyData[key], id: key }))
          .filter(
            (story) =>
              story.projectId === projectId && story.status === "Realised_Assigned"
          );
        console.log(storiesArray);

        const taskResponse = await fetch(
          `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/tasks.json`
        );
        const taskData = await taskResponse.json();
        const taskArray = Object.keys(taskData || {})
          .map((key) => ({ ...taskData[key], id: key }))
          .filter((task) => storiesArray.some((story) => story.id === task.user_story_id));

        console.log(taskArray);
        setTask(taskArray);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setTask([]);
        setIsLoading(false);
      }
    };

    fetchProject();
    fetchTasks();
  }, [projectId]);

  const handleEditStory = (storyId) => {
    navigate(`/projects/edit-userStory/${storyId}`);
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
  
    if (!destination) return;
  
    const taskDragged = task.find((s) => s.id === draggableId);
    if (!taskDragged) return;
  
    const updatedTask = { ...taskDragged, status: destination.droppableId };
  
   
    if (destination.droppableId === "Active") {
      updatedTask.startTime = new Date().toISOString(); 
    }
  
   
    if (destination.droppableId === "Assigned" && source.droppableId === "Active") {
      updatedTask.finishTime = new Date().toISOString(); 
    }
  
    try {
      const response = await fetch(
        `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/tasks/${updatedTask.id}.json`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTask),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update the task.");
      }
  
      console.log("Task updated successfully:", updatedTask);
  
      const newTasks = task.filter((s) => s.id !== draggableId);
      newTasks.splice(destination.index, 0, updatedTask);
      console.log("Old state:", task);
      console.log("New state:", newTasks);
      setTask(newTasks);
      console.log(
        `Item ${draggableId} moved from ${source.droppableId} to ${destination.droppableId}`
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
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
                      <p className="assigned-to">
                        Assigned to: {taskItem.assignedTo}
                      </p>
                      <p className="time-estimate">
                        Time estimate: {taskItem.projected_time}
                      </p>
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

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="tasks-list">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="scrum-board-container">
          <Column title="Unassigned" status="Unassigned" tasks={task} />
          <Column title="Assigned" status="Assigned" tasks={task} />
          <Column title="Active" status="Active" tasks={task} />
          <Column title="Finished" status="Finished" tasks={task} />
        </div>
      </DragDropContext>
    </div>
  );
};

export default SprintBacklogTab;
