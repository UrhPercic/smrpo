import React, { useState, useEffect } from "react";
import { getDatabase, ref, push } from "firebase/database";
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
    // Adjust role counts based on your application's rules
    const roleAssignments = { PO: 0, KBM: 0, DOM: 0 };

    formData.users.forEach(user => {
      if (user.role === "Project Owner") roleAssignments.PO += 1;
      if (user.role === "Scrum Master") roleAssignments.KBM += 1;
      if (user.role === "Development Team Member") roleAssignments.DOM += 1;
    });

    // Validate unique roles (PO and KBM) and ensure DOM role can have multiples
    const isValidPO = roleAssignments.PO === 1; // Exactly one PO
    const isValidKBM = roleAssignments.KBM == 1; // At most one KBM
    const isValidDOM = roleAssignments.DOM > 0;
    // No need to validate DOM explicitly unless you have a minimum number required

    return isValidPO && isValidKBM && isValidDOM;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateRoles()) {
      alert("Please ensure the roles are correctly assigned according to the rules.");
      return;
    }
  
    // Prepare projectData with rolesByUser as before
    const projectData = {
      name: formData.name,
      description: formData.description,
      users: formData.users.reduce((acc, { userId, role }) => {
        (acc[userId] = acc[userId] || []).push(role);
        return acc;
      }, {}),
    };
  
    const db = getDatabase();
    push(ref(db, 'projects'), projectData)
      .then(() => alert("Project added successfully"))
      .catch((error) => {
        console.error("Failed to add project:", error);
        alert("Failed to add project: " + error.message);
      });
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

