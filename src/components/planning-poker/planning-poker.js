import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getData } from "../../db/realtimeDatabase";
import "./planning-poker.css";

const PlanningPoker = () => {
  const { projectId } = useParams();
  const [userStories, setUserStories] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedStoryId, setSelectedStoryId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());

  useEffect(() => {
    const fetchUserStories = async () => {
      try {
        const storiesData = await getData("/userStory");
        const storiesInProject = Object.values(storiesData || {}).filter(
          (story) => story.projectId === projectId
        );
        setUserStories(storiesInProject);
      } catch (error) {
        console.error("Error fetching user stories:", error);
        setUserStories([]);
      }
    };

    const fetchAllUsers = async () => {
      try {
        const allUsers = await getData("/users");
        const usersArray = Object.keys(allUsers).map((key) => ({
          id: key,
          ...allUsers[key],
        }));
        setUsers(usersArray);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (projectId) {
      fetchUserStories();
      fetchAllUsers();
    }
  }, [projectId]);

  const handleStorySelection = (e) => {
    setSelectedStoryId(e.target.value);
  };

  const handleUserCheckboxChange = (userId) => {
    setSelectedUserIds((prevSelectedUserIds) => {
      const newSelectedUserIds = new Set(prevSelectedUserIds);
      if (newSelectedUserIds.has(userId)) {
        newSelectedUserIds.delete(userId);
      } else {
        newSelectedUserIds.add(userId);
      }
      return newSelectedUserIds;
    });
  };

  const isStartEnabled = selectedStoryId && selectedUserIds.size >= 2;

  return (
    <div className="container">
      <div className="content">
        <select onChange={handleStorySelection} value={selectedStoryId}>
          <option value="">Select a story</option>
          {userStories.map((story) => (
            <option key={story.id} value={story.id}>
              {story.userStoryName}
            </option>
          ))}
        </select>
        <h3>Select users to play</h3>
        <div className="users">
          {users.map((user) => (
            <div>
              <input
                type="checkbox"
                id={`${user.id}`}
                checked={selectedUserIds.has(user.id)}
                onChange={() => handleUserCheckboxChange(user.id)}
              />
              <label>{user.username}</label>
            </div>
          ))}
        </div>
        <div className="button">
          <button disabled={!isStartEnabled} className="default-button">
            Start poker
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanningPoker;
