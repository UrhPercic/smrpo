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
            .filter((task) => task.user_story_id == storyId);
          setTasks(tasksArray);
          console.log(allTasks);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchUserStory();
    fetchTasks();
    console.log(tasks);
  }, [storyId]);

  const handleTaskClick = (taskId) => {
    navigate("/projects/edit-task", { state: { taskId } });
  };

  return (
    <div className="container">
      <div className="content">
        {userStory !== null && <h1>User story - {userStory.userStoryName}</h1>}
        <div className="tasks">
          {tasks.map((task) => (
            <div className="task" onClick={() => handleTaskClick(task.id)}>
              {task.name}
              {task.id}
              <i className="fa-solid fa-pen-to-square"></i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryTasksComponent;
