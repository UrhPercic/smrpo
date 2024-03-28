import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// Ensure Bootstrap CSS is imported in your main file, e.g., index.js or App.js

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
    });
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
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
    <div className="container mt-3">
      <h2>Edit Project</h2>
      <form onSubmit={handleSubmit} className="mb-3">
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Project Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={projectData.name}
            onChange={handleChange}
            required />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="3"
            value={projectData.description}
            onChange={handleChange}
            required></textarea>
        </div>

        <h4>Project Users</h4>
        {projectData.users.map((user, index) => (
          <div key={index} className="d-flex justify-content-between align-items-center mb-2">
            <span>{`${user.name} (${user.role})`}</span>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => removeUser(user.userId)}>Remove</button>
          </div>
        ))}

        {/* Add User and Role selection with more spacing */}
        <div className="mb-4"> {/* Increase spacing to the next field */}
          <label htmlFor="userSelect" className="form-label">Select User to Add</label>
          <select id="userSelect" className="form-select" value={newUserId} onChange={e => setNewUserId(e.target.value)}>
            <option value="">Select User</option>
            {availableUsers.filter(au => !projectData.users.some(u => u.userId === au.id))
              .map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
        </div>

        <div className="mb-4"> {/* Maintain consistent spacing for the role selection */}
          <label htmlFor="roleSelect" className="form-label">Select Role</label>
          <select id="roleSelect" className="form-select" value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
            <option value="">Select Role</option>
            <option value="Project Owner">Project Owner</option>
            <option value="Scrum Master">Scrum Master</option>
            <option value="Development Team Member">Development Team Member</option>
          </select>
        </div>

        {/* Button container for alignment */}
        <div className="d-flex justify-content-start align-items-center">
          <button type="button" className="btn btn-primary me-2" onClick={addNewUser}>Add User</button>
          <button type="submit" className="btn btn-success">Update Project</button>
        </div>

      </form>
    </div>
  );
};

export default ProjectEditForm;

