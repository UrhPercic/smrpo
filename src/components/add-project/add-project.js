import React, { useState, useEffect } from "react";

const AddProjectForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    users: [{ userId: "", role: "" }], // Start with one empty user-role pair
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [roles] = useState(["Product Manager", "Methodology Manager", "Development Team Member"]); // Static roles for simplicity

  useEffect(() => {
    // Fetch available users
    fetch("http://localhost:3001/api/users")
      .then((response) => response.json())
      .then(setAvailableUsers);
  }, []);

  const handleUserChange = (index, value) => {
    const newUsers = [...formData.users];
    newUsers[index].userId = value;
    setFormData({ ...formData, users: newUsers });
  };

  const handleRoleChange = (index, value) => {
    const newUsers = [...formData.users];
    newUsers[index].role = value;
    setFormData({ ...formData, users: newUsers });
  };

  const addAnotherUser = () => {
    setFormData({
      ...formData,
      users: [...formData.users, { userId: "", role: "" }],
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Format the project data to be sent to the server
    const projectData = {
      name: formData.name,
      description: formData.description,
      users: formData.users.map(user => ({
        userId: user.userId,
        role: user.role
      }))
    };
  
    // Send the project data to the server
    try {
      const response = await fetch("http://localhost:3001/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });
  
      if (response.ok) {
        const data = await response.json();
        alert("Project added successfully: " + data.projectId);
        // Optionally reset form here or navigate to another page
      } else {
        const errorData = await response.json();
        alert("Failed to add project: " + errorData.error);
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <h1>Add Project</h1>
      <label htmlFor="description">Project Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
      <form onSubmit={handleSubmit}>
        {formData.users.map((userRole, index) => (
          
          <div key={index}>
            <label htmlFor="projectName">Project Name:</label>
            <input
              type="text"
              id="projectName"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            
            {/* User selection and role assignment inputs */}
            <select value={userRole.userId} onChange={(e) => handleUserChange(index, e.target.value)}>
              <option value="">Select a User</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <select value={userRole.role} onChange={(e) => handleRoleChange(index, e.target.value)}>
              <option value="">Select Role</option>
              {roles.map((role, roleIndex) => (
                <option key={roleIndex} value={role}>{role}</option>
              ))}
            </select>
            {index === formData.users.length - 1 && <button type="button" onClick={addAnotherUser}>Add Another User</button>}
          </div>
        ))}
        <button type="submit">Add Project</button>
      </form>
    </div>
  );
};

export default AddProjectForm;
