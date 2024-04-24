import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getData } from "../../db/realtimeDatabase";
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
  const [originalName, setOriginalName] = useState("");
  const [userRole, setUserRole] = useState("Unknown");
  const [project, setProject] = useState({users: []});

  const getCurrentUserRole = (users) => {
    const userId = localStorage.getItem("userId");
    const userRolesMap = users.reduce((acc, user) => {
        const roleName = user[0];
        const userId = user.id;
        acc[userId] = roleName;
        return acc;
    }, {});
    if (userRolesMap[userId]) {
        console.log("User role found:", userRolesMap[userId]);
        return userRolesMap[userId];
    }
    return "Unknown";
};


  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:3001/api/projects/${projectId}`).then(res => res.json()),
      fetch("http://localhost:3001/api/users").then(res => res.json())
    ]).then(([projectData, usersData]) => {
      if (projectData && typeof projectData.users === 'object' && !Array.isArray(projectData.users)) {
        // Convert users object into an array
        setOriginalName(projectData.name);
        const users = Object.keys(projectData.users).map((key) => ({
          id: key,
        }));
        const usersArray = Object.entries(projectData.users).map(([userId, roles]) => {
          const foundUser = usersData.find(u => u.id === userId);
          return {
            userId: userId,
            name: foundUser ? foundUser.name : "Unknown User",
            roles: roles,
          };
        });
        setProjectData({
          name: projectData.name,
          description: projectData.description,
          users: usersArray,
        });
        const fetchProject = async () => {
          const fetchedProject = await getData(`/projects/${projectId}`);
          if (fetchedProject) {
            const users = Object.keys(fetchedProject.users).map((key) => ({
              id: key,
              ...fetchedProject.users[key],
            }));
            setProject({ ...fetchedProject, users }); // Merge existing properties with initialized users array
            const currentUserRole = getCurrentUserRole(users); // Pass users array to getCurrentUserRole
            setUserRole(currentUserRole);
          }
        };
        fetchProject();
      } else {
        console.error('Unexpected structure for users:', projectData.users);
      }
  
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
    
    // Find user details from availableUsers
    const userToAddDetails = availableUsers.find(user => user.id === newUserId);
    if (!userToAddDetails) {
      console.error('User details not found');
      return;
    }
    
    // Prepare a new or updated user object
    let updatedUsers = [...projectData.users];
    const existingUserIndex = updatedUsers.findIndex(user => user.userId === newUserId);
  
    if (existingUserIndex !== -1) {
      // User already exists, append role if it's new
      const existingRoles = updatedUsers[existingUserIndex].roles;
      if (!existingRoles.includes(newUserRole)) {
        updatedUsers[existingUserIndex].roles = [...existingRoles, newUserRole];
      }
    } else {
      // New user for the project
      updatedUsers.push({
        userId: newUserId,
        name: userToAddDetails.name,
        roles: [newUserRole],
      });
    }
  
    setProjectData(prevData => ({
      ...prevData,
      users: updatedUsers
    }));
  
    // Optionally reset the form fields if needed
    setNewUserId('');
    setNewUserRole('');
  };
  

  const removeUser = (userIdToRemove) => {
    setProjectData(prevData => ({
      ...prevData,
      users: prevData.users.filter(user => user.userId !== userIdToRemove)
    }));
    console.log(userRole)
  };

  const validateRoles = () => {
    const roleCounts = projectData.users.reduce((acc, user) => {
      user.roles.forEach(role => {
        if (!acc[role]) {
          acc[role] = 0;
        }
        acc[role]++;
      });
      return acc;
    }, {});
  
    const isValidPO = roleCounts["Project Owner"] === 1; // Exactly one Project Owner
    const isValidSM = roleCounts["Scrum Master"] <= 1; // At most one Scrum Master
    const isValidDTM = roleCounts["Development Team Member"] > 0; // At least one Development Team Member
  
    return isValidPO && isValidSM && isValidDTM;
  };

  const checkProjectNameExists = async (newName) => {
    try {
      const projectsSnapshot = await getData('/projects');
      const projectsData = Object.values(projectsSnapshot);
  
      // Check for name clash excluding the current project if it is the same as the original
      const nameExists = projectsData.some(project => project.name === newName && project.name !== originalName);
  
      
      return nameExists;
    } catch (error) {
      console.error('Error checking project name:', error);
      return false;
    }
  };
  
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateRoles()) {
      alert("Please ensure the roles are correctly assigned according to the rules.");
      return;
    }
    const nameExists = await checkProjectNameExists(projectData.name);
    if (nameExists) {
      alert("The project name is already taken by another project. Please choose a different name.");
      return;
    }
  
    try {
      const updatedProjectData = {
        name: projectData.name,
        description: projectData.description,
        users: projectData.users.reduce((acc, user) => {
          acc[user.userId] = user.roles;
          return acc;
        }, {})
      };
  
      const response = await fetch(`http://localhost:3001/api/projects/update/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProjectData),
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
            <span>{`${user.name} (${user.roles.join(", ")})`}</span>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => removeUser(user.userId)}>Remove</button>
          </div>
        ))}






        {/* Add User and Role selection with more spacing */}
        <div className="mb-4"> {/* Increase spacing to the next field */}
          <label htmlFor="userSelect" className="form-label">Select User to Add</label>
          {/* Remove filtering that excludes already selected users */}
          <select id="userSelect" className="form-select" value={newUserId} onChange={e => setNewUserId(e.target.value)}>
            <option value="">Select User</option>
            {availableUsers.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
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
          
          {userRole === 'Scrum Master' ? (
                        <>
                        <button type="submit" className="btn btn-success">Update Project</button>
                        
                        </>
                        ) : (
                          <>

                          </>
                      )}
        </div>

      </form>
    </div>
  );
};

export default ProjectEditForm;

