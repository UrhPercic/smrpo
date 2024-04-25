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
  const [manualTime, setManualTime] = useState({ taskId: "", hours: 0, minutes: 0, seconds: 0 });

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

  const handleManualTimeInput = (taskId) => {
    setManualTime({ ...manualTime, taskId: taskId, hours: 0, minutes: 0, seconds: 0 });
  };

  const handleManualTimeSubmit = async () => {
    // Calculate total time in seconds
    const totalSeconds = manualTime.hours * 3600 + manualTime.minutes * 60 + manualTime.seconds;

    // Format total time to HH:MM:SS
    const formattedTime = formatSecondsToTime(totalSeconds);

    // Update task in the database with manual time
    try {
      await updateData(`/tasks/${manualTime.taskId}`, { manual_time: formattedTime });
    } catch (error) {
      console.error("Error updating task with manual time:", error);
    }

    // Clear manual time state
    setManualTime({ taskId: "", hours: 0, minutes: 0, seconds: 0 });
  };

  return (
    <div className="container">
      <div className="content">
        {userStory !== null && <h1>User story - {userStory.userStoryName}</h1>}
        <div className="tasks">
          {tasks.map((task) => (
            <div key={task.id} className="task-container">
              <div
                className="task"
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
                  {task.manual_time && (
                    <span className="manual-time">
                      Manual Time: {task.manual_time}
                    </span>
                  )}
                </div>
                <i className="fa-solid fa-pen-to-square"></i>
              </div>
              <button onClick={() => handleManualTimeInput(task.id)}>Add/Edit Manual Time</button>
              {manualTime.taskId === task.id && (
                <div className="manual-time-input">
                  <input
                    type="number"
                    placeholder="Hours"
                    value={manualTime.hours}
                    onChange={(e) => setManualTime({ ...manualTime, hours: parseInt(e.target.value) })}
                  />
                  <input
                    type="number"
                    placeholder="Minutes"
                    value={manualTime.minutes}
                    onChange={(e) => setManualTime({ ...manualTime, minutes: parseInt(e.target.value) })}
                  />
                  <input
                    type="number"
                    placeholder="Seconds"
                    value={manualTime.seconds}
                    onChange={(e) => setManualTime({ ...manualTime, seconds: parseInt(e.target.value) })}
                  />
                  <button onClick={handleManualTimeSubmit}>Submit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryTasksComponent;
