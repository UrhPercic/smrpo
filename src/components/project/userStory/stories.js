import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getData } from "../../../db/realtimeDatabase";

const Story = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [stories, setStories] = useState([]);

    useEffect(() => {
        const storyId = localStorage.getItem("storyId");
        if (!storyId) {
            navigate("/");
            return;
        }

        const fetchStoryDetails = async () => {
            try {
                const userData = await getData(`/userStory/${storyId}`);
                if (userData.privilege === "admin") {
                    setIsAdmin(true);
                    fetchAllStories();
                } else {
                    navigate("/home");
                }
            } catch (error) {
                console.error("Error fetching userStory details:", error);
                navigate("/");
            }
        };

        const fetchAllStories = async () => {
            try {
                const allUsers = await getData("/userStory");
                if (allUsers) {
                    const usersArray = Object.keys(allUsers).map((key) => ({
                        id: key,
                        ...allUsers[key],
                    }));
                    setStories(usersArray);
                }
            } catch (error) {
                console.error("Error fetching Story:", error);
            }
        };

        fetchStoryDetails();
    }, [navigate]);

    const handleUserClick = (storyId) => {
        navigate("/userStory/edit", { state: { storyId } });
    };

    return  (
        <div className="container">
            <div className="content">
                <h1>Stories</h1>
                <div className="users">
                    {stories.map((story) => (
                        <div
                            key={story.id}
                            className="user"
                            onClick={() => handleUserClick(story.id)}
                        >
                            {story.name}
                            <i className="fa-solid fa-pen-to-square"></i>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default Story;
