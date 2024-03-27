import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {addData, getData} from "../../../db/realtimeDatabase";
import "./add-userStory.css";

const StoryList = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [story, setStory] = useState([]);

    useEffect(() => {
        const fetchProject = async () => {
            const fetchedProject = await getData(`/projects/${projectId}`);
            if (fetchedProject) {
                setProject(fetchedProject);
            }
        };

        const fetchStories = async () => {
            fetch(`https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/userStory.json`)
                .then((response) => response.json())
                .then(data => {
                    // Convert object to array
                    const storiesArray = Object.values(data || {});
                    setStory(storiesArray);
                })
                .catch(error => {
                    console.error("Failed to fetch stories:", error);
                    setStory([]); // Fallback in case of error
                });
        }

        fetchStories();
        fetchProject();
    }, [projectId]);

    return(
        <div className="sprints-list">
            <h2>Stories:</h2>
            {story.map(stories => {
                    return(
                        <div key={stories.id} className="sprint-section">
                            <h3>{stories.userStoryName}</h3>
                            <p>Description: {stories.description}</p>
                            <p>Test: {stories.test}</p>
                            <p>Business Value: {stories.businessValue}</p>
                            <p>Priority: {stories.priority}</p>
                        </div>

                    )
                }
            )}
        </div>
    )

}

export default StoryList;