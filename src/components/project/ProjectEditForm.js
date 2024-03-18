import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const ProjectEditForm = () => {
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    users: [],
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [newUserId, setNewUserId] = useState('');
  const [newUserRole, setNewUserRole] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:3001/api/projects/${projectId}`).then(res => res.json()),
      fetch("http://localhost:3001/api/users").then(res => res.json())
    ]).then(([projectData, usersData]) => {
      const usersArray = projectData.users ? Object.entries(projectData.users).map(([userId, userDetails]) => {
        const user = usersData.find(user => user.id === userId);
        return {
          userId,
          name: user ? user.name : "Unknown User",
          ...userDetails
        };
      }) : [];
    
      setProjectData({ 
        name: projectData.name, 
        description: projectData.description, 
        users: usersArray 
      });
  
      setAvailableUsers(usersData);
    }).catch(error => {
      console.error("Error fetching data:", error);
      // Handle error appropriately
    });
  }, [projectId]);
  
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (index, e) => {
    const newUsers = [...projectData.users];
    newUsers[index] = { ...newUsers[index], [e.target.name]: e.target.value };
    setProjectData(prev => ({ ...prev, users: newUsers }));
  };

  const addNewUser = () => {
    if (!newUserId || !newUserRole) return;
    const userToAdd = availableUsers.find(user => user.id === newUserId);
    if (userToAdd) {
      setProjectData(prevData => ({
        ...prevData,
        users: [...prevData.users, { userId: userToAdd.id, role: newUserRole }]
      }));
      setNewUserId('');
      setNewUserRole('');
    }
  };

  const removeUser = (userIdToRemove) => {
    setProjectData(prevData => ({
      ...prevData,
      users: prevData.users.filter(user => user.userId !== userIdToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/api/projects/update/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        alert("Project updated successfully");
        // Navigate or update UI accordingly
      } else {
        const errorData = await response.json();
        alert("Failed to update project: " + errorData.error);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("An error occurred while updating the project.");
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      {/* Project name and description fields */}
      
      {/* Existing users display/editing */}
      {projectData.users.map((user, index) => (
        <div key={index}>
          <p>{`Name: ${user.name}, Role: ${user.role}`}</p> {/* Adjusted to show user.name */}
          <button type="button" onClick={() => removeUser(user.userId)}>Remove</button>
        </div>
      ))}


      {/* New user addition */}
      <div>
        <select value={newUserId} onChange={e => setNewUserId(e.target.value)}>
          <option value="">Select User to Add</option>
          {availableUsers.filter(au => !projectData.users.some(u => u.userId === au.id))
                         .map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
        </select>
        <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
          <option value="">Select Role</option>
          {/* Assume these roles are predefined or fetched */}
          <option value="Developer">Developer</option>
          <option value="Designer">Designer</option>
        </select>
        <button type="button" onClick={addNewUser}>Add User</button>
      </div>

      <button type="submit">Update Project</button>
    </form>
  );
};

export default ProjectEditForm;
