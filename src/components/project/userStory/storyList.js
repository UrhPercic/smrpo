import React, {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import { getData} from "../../../db/realtimeDatabase";
import "./storyList.css";

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
                    const storiesArray = Object.keys(data || {}).map(key => ({
                        ...data[key],
                        id: key,
                    }));
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

    const handleDeleteStory = async (storyId) => {
        const shouldDelete = window.confirm('Are you sure you want to delete this story?');
        if (shouldDelete) {
            try {
                const deleteResponse = await fetch(`https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app/userStory/${storyId}.json`, {
                    method: 'DELETE'
                });

                if (!deleteResponse.ok) {
                    throw new Error('Failed to delete the story.');
                }

                setStory(prevStories => prevStories.filter(story => story.id !== storyId));
            } catch (error) {
                console.error("Error deleting the story:", error);
            }
        }
    };

    return(
        <div className="story-list">
            <h2>Stories:</h2>
            {story.map(stories => {
                    return(
                        <div key={stories.id} className="story-section">
                            <h3>Name: {stories.userStoryName}</h3>
                            <p>Description: {stories.description}</p>
                            <p>Test: {stories.test}</p>
                            <p>Business Value: {stories.businessValue}</p>
                            <p>Priority: {stories.priority}</p>

                            <div className="edit-story-button">
                                <Link to={`/projects/edit-story/${stories.id}`} className="btn">
                                    Edit Story
                                </Link>
                                <button onClick={() => handleDeleteStory(stories.id)} className="btn delete">
                                    Delete
                                </button>
                            </div>
                        </div>
                    )
                }
            )}
        </div>
    )
}

export default StoryList;