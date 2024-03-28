import React, { useState, useEffect } from "react";
// Import Bootstrap CSS in your main file if not already imported
// import 'bootstrap/dist/css/bootstrap.min.css';

const AddProjectForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    users: [{ userId: "", role: "" }], // Start with one empty user-role pair
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [roles] = useState(["Project Owner", "Scrum Master", "Development Team Member"]);


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

  // Validation function
  const validateRoles = () => {
    const rolesCount = { ProjectOwner: 0, ScrumMaster: 0, DevelopmentTeamMember: 0 };

    formData.users.forEach(user => {
      if (user.role === "Project Owner") rolesCount.ProjectOwner += 1;
      if (user.role === "Scrum Master") rolesCount.ScrumMaster += 1;
      if (user.role === "Development Team Member") rolesCount.DevelopmentTeamMember += 1;
    });

    // Check if each role has at least one member
    return rolesCount.ProjectOwner > 0 && rolesCount.ScrumMaster > 0 && rolesCount.DevelopmentTeamMember > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate roles before submitting
    if (!validateRoles()) {
      alert("You must have at least 1 Project Owner, 1 Scrum Master, and 1 Developer.");
      return; // Stop the form submission
    }

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
    <div className="container mt-5">
      <h1 className="mb-4">Add Project</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="projectName" className="form-label">Project Name:</label>
          <input
            type="text"
            className="form-control"
            id="projectName"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Project Description:</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        {formData.users.map((userRole, index) => (
          <div key={index} className="mb-3">
            <select className="form-select mb-2" value={userRole.userId} onChange={(e) => handleUserChange(index, e.target.value)}>
              <option value="">Select a User</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <select className="form-select" value={userRole.role} onChange={(e) => handleRoleChange(index, e.target.value)}>
              <option value="">Select Role</option>
              {roles.map((role, roleIndex) => (
                <option key={roleIndex} value={role}>{role}</option>
              ))}
            </select>
          </div>
        ))}
        <div className="mb-3">
          <button type="button" className="btn btn-primary me-2" onClick={addAnotherUser}>Add Another User</button>
          <button type="submit" className="btn btn-success">Add Project</button>
        </div>
      </form>
    </div>
  );
};

export default AddProjectForm;

