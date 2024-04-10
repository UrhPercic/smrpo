import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {getData} from "../../../db/realtimeDatabase";
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';

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
        navigate("/userStory/edit", {state: {storyId}});
    };

    function handleOnDragEnd(result) {
        if (!result.destination) return;

        const items = Array.from(stories);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setStories(items);
    }

    return (
        <div className="container">
            <div className="content">
                <h1>Stories</h1>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="stories">
                        {(provided) => (
                            <ul className="stories" {...provided.droppableProps} ref={provided.innerRef}>
                                {stories.map(({id, name, thumb}, index) => {
                                    return (
                                        <Draggable key={id} draggableId={id} index={index}>
                                            {(provided) => (
                                                <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>

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
                                                </li>


                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    )
};

export default Story;
