import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getData } from "../../db/realtimeDatabase";

const StoryTasksComponent = () => {
    const { storyId } = useParams();
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasksData = await getData(`/tasks`, { user_story_id: storyId });
                console.log("Tasks Data:", tasksData); // Log the tasks data to see what's being fetched
                if (Array.isArray(tasksData)) {
                    setTasks(tasksData);
                } else if (typeof tasksData === "object") {
                    // Convert object to array
                    const tasksArray = Object.values(tasksData);
                    setTasks(tasksArray);
                } else {
                    console.error("Error: tasksData is neither an array nor an object");
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchTasks();
    }, [storyId]);

    return (
        <div>
            <h1>Tasks for Story {storyId}</h1>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        <div>Name: {task.name}</div>
                        <div>Projected Time: {task.projected_time}</div>
                        <div>Created At: {task.created_at}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StoryTasksComponent;
