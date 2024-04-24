import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getData } from "../../../db/realtimeDatabase";
import "./storytasks.css";

const StoryTasksComponent = () => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [userStory, setUserStory] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [responsibleUsers, setResponsibleUsers] = useState({}); // State to store responsible users

  useEffect(() => {
    const fetchUserStory = async () => {
      try {
        const userStoryData = await getData(`/userStory/${storyId}`);
        setUserStory(userStoryData);
      } catch (error) {
        console.error("Error fetching user story:", error);
      }
    };

    const fetchTasks = async () => {
      try {
        const allTasks = await getData(`/tasks`);
        if (allTasks) {
          const tasksArray = Object.keys(allTasks)
            .map((key) => ({
              id: key,
              ...allTasks[key],
            }))
            .filter((task) => task.user_story_id === storyId);
          setTasks(tasksArray);

          // Fetch responsible user for each task
          tasksArray.forEach(async (task) => {
            try {
              const responsibleUserData = await getData(
                `/users/${task.responsible_user_id}`
              );
              // Update the responsibleUsers state with the responsible user data
              setResponsibleUsers((prevUsers) => ({
                ...prevUsers,
                [task.id]: responsibleUserData,
              }));
            } catch (error) {
              console.error("Error fetching responsible user:", error);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchUserStory();
    fetchTasks();
  }, [storyId]);

  const handleTaskClick = (taskId, isAssigned) => {
    if (!isAssigned) {
      navigate(`/projects/edit-task/${taskId}`);
    }
  };

  return (
    <div className="container">
      <div className="content">
        {userStory !== null && <h1>User story - {userStory.userStoryName}</h1>}
        <div className="tasks">
          {tasks.map((task) => (
            <div
              className="task"
              key={task.id}
              onClick={() =>
                handleTaskClick(task.id, task.status === "Assigned")
              }
            >
              <div className="task-user">
                <strong>{task.name}</strong>
                {responsibleUsers[task.id] && (
                  <span className="responsible-user">
                    Responsible user: {responsibleUsers[task.id].username}
                  </span>
                )}
              </div>
              <i className="fa-solid fa-pen-to-square"></i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryTasksComponent;
