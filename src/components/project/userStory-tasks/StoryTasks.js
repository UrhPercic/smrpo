import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getData, updateData } from "../../../db/realtimeDatabase";
import "./storytasks.css";

const StoryTasksComponent = () => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [userStory, setUserStory] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [responsibleUsers, setResponsibleUsers] = useState({});

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

          for (const task of tasksArray) {
            try {
              const timeLogs = await getData(`/time_log`, {
                orderBy: "task_id",
                equalTo: task.id,
              });

              let totalTimeSpent = 0;
              Object.values(timeLogs).forEach((log) => {
                totalTimeSpent += parseTimeToSeconds(log.time_spent);
              });

              // Update the task in the database with the total time spent
              await updateData(`/tasks/${task.id}`, { total_time_spent: formatSecondsToTime(totalTimeSpent) });
            } catch (error) {
              console.error("Error fetching or updating time logs:", error);
            }
          }

          // Now fetch the updated tasks from the database
          const updatedTasks = await getData(`/tasks`);
          const updatedTasksArray = Object.keys(updatedTasks)
            .map((key) => ({
              id: key,
              ...updatedTasks[key],
            }))
            .filter((task) => task.user_story_id === storyId);

          setTasks(updatedTasksArray);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchUserStory();
    fetchTasks();
  }, [storyId]);

  const parseTimeToSeconds = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatSecondsToTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes}:${seconds}`;
  };

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
                {task.total_time_spent && (
                  <span className="total-time-spent">
                    Total Time Spent: {task.total_time_spent}
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
