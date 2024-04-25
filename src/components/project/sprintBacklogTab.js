import React, { useState, useEffect, Suspense } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getData } from "../../db/realtimeDatabase";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import "./sprintBacklogTab.css";

const SprintBacklogTab = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({ users: [] });
  const [task, setTask] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [assignedUserName, setAssignedUserName] = useState("");
  const [assignedId, setAssignedId] = useState("");
  const [userRole, setUserRole] = useState("Unknown");
  const userId = localStorage.getItem("userId");


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
    const storedAssignedUserName = localStorage.getItem("assignedUserName");
    if (storedAssignedUserName) {
      setAssignedUserName(storedAssignedUserName);
      setAssignedId(userId);

    }
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

    const fetchUsers = async () => {
      fetch('https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/users.json')
        .then(response => response.json())
        .then(data => {
          const formattedUsers = Object.keys(data).reduce((acc, key) => {
            acc[key] = data[key];
            return acc;
          }, {});
          setUsers(formattedUsers);
        })
        .catch(error => console.error("Failed to fetch users:", error));
    };


    const fetchTasks = async () => {
      var storiesArray = [];
      setIsLoading(true);
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
            .filter((story) => story.status === "Unrealised_Active");
          console.log(storiesArray);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch stories:", error);
          setIsLoading(false);
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
              return storiesArray.some(
                (story) => story.id === task.user_story_id
              );
            });

          console.log(taskArray);
          setTask(taskArray);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch stories:", error);
          setTask([]);
          setIsLoading(false);
        });
    };

    fetchProject();
    fetchUsers();
    fetchTasks();
  }, []);

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  const handleEditStory = (storyId) => {
    navigate(`/projects/edit-userStory/${storyId}`);
  };

  const getUserName = (userId) => {
    return users[userId] ? users[userId].name : 'Unknown User';
  };
  //console.log("User Name:", getUserName(userId));

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const taskDragged = task.find((s) => s.id === draggableId);
    if (!taskDragged) return;

    const updatedTask = { ...taskDragged, status: destination.droppableId };

    await updateStoryInBackend(updatedTask);

    const newTasks = task.filter((s) => s.id !== draggableId);
    newTasks.splice(destination.index, 0, updatedTask);
    setTask(newTasks);
    console.log(
      `Item ${draggableId} moved from ${source.droppableId} to ${destination.droppableId}`
    );


    if (
      source.droppableId === "Unassigned" &&
      destination.droppableId === "Assigned"

    ) {
      setAssignedId(userId);
      if (!assignedUserName) {
        const userName = getUserName(userId);
        localStorage.setItem("assignedUserName", userName);

        setAssignedUserName(userName);
        setAssignedId(userId);
        console.log("0000", userId)
        console.error("USER ROLE", userRole);
      }
    }

    if (source.droppableId === "Assigned" && destination.droppableId === "Unassigned") {
      console.log("1111", assignedId)
      console.log("2222", userId)
      if (assignedId === userId) {
        localStorage.removeItem("assignedUserName");
        localStorage.removeItem("assignedUserId");
        setAssignedUserName("");
        setAssignedId("");
        // Logic to update the task status goes here
      } else {
        console.log("You are not allowed to move this task.");
        return; // Prevent the task from being moved
      }
    }



    // Check if task moved from Assigned to Active
    if (
      source.droppableId === "Assigned" &&
      destination.droppableId === "Active"
    ) {
      updatedTask.startTime = new Date().toISOString(); // Capture start time
    }

    // Check if task moved from Active back to Assigned
    if (
      source.droppableId === "Active" &&
      destination.droppableId === "Assigned"
    ) {
      updatedTask.finishTime = new Date().toISOString(); // Capture finish time

      // Calculate time spent
      const startTime = new Date(updatedTask.startTime).getTime();
      const endTime = new Date(updatedTask.finishTime).getTime();
      const timeSpentMillis = endTime - startTime;

      const hours = Math.floor(timeSpentMillis / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeSpentMillis % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((timeSpentMillis % (1000 * 60)) / 1000);

      const timeSpent = `${hours}:${minutes}:${seconds}`;

      // Log the time spent into the database
      const newTimeLogEntry = {
        task_id: updatedTask.id,
        user_id: updatedTask.responsible_user_id,
        start: updatedTask.startTime,
        end: updatedTask.finishTime,
        time_spent: timeSpent,
      };

      try {
        const response = await fetch(
          `https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/time_log.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newTimeLogEntry),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to insert entry into time_log table.");
        }

        console.log("New entry in time_log table:", newTimeLogEntry);
      } catch (error) {
        console.error("Error:", error);
      }
    }
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
            className={`sub-column-content ${snapshot.isDraggingOver ? "droppable-over" : ""
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
                      className={`task-section ${snapshot.isDragging ? "dragging-task" : ""
                        }`}
                    >
                      <h4>{taskItem.name}</h4>
                      <p className="description-preview">
                        {taskItem.description}
                      </p>
                      <p className="assigned-to">
                        Assigned to: {assignedUserName}
                      </p>
                      <p className="time-estimate">
                        Time estimate: {taskItem.projected_time}
                      </p>
                      {taskItem.startTime && (
                        <p className="start-time">
                          Start Time: {taskItem.startTime}
                        </p>
                      )}
                      {taskItem.finishTime && (
                        <p className="finish-time">
                          Finish Time: {taskItem.finishTime}
                        </p>
                      )}
                      {taskItem.timeSpent && (
                        <p className="time-spent">
                          Time Spent: {taskItem.timeSpent}
                        </p>
                      )}
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
