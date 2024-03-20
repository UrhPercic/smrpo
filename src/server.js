const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./smrpo-acd88-firebase-adminsdk-f69im-a6c9679471.json');
const cors = require('cors');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://smrpo-acd88-default-rtdb.europe-west1.firebasedatabase.app'
});

const app = express();


app.use(cors());
// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Route for creating a new project
app.post('/api/projects/create', async (req, res) => {
  try {
    const { name, description, users } = req.body;
    
    // Assuming users is an array of objects { userId, role }
    const formattedUsers = users.reduce((acc, user) => {
      acc[user.userId] = { role: user.role };
      return acc;
    }, {});

    const projectData = {
      name,
      description,
      created_at: new Date().toISOString(),
      users: formattedUsers,
    };

    const newProjectRef = await admin.database().ref('projects').push(projectData);
    
    res.status(200).json({ message: 'Project created successfully', projectId: newProjectRef.key });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'An error occurred while creating the project' });
  }
});

// Assuming Express and Firebase Admin are already set up
app.post('/api/projects/update/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { name, description, users } = req.body; // Destructure the expected fields from the request body

  try {
    // Path to the specific project in Firebase Realtime Database
    const projectRef = admin.database().ref(`projects/${projectId}`);

    // Update the project details. Firebase automatically handles adding new members,
    // updating existing ones, and removing those not included in the 'users' array.
    await projectRef.update({ name, description, users });

    res.status(200).json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'An error occurred while updating the project' });
  }
});

// Route to fetch all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projectsRef = admin.database().ref('projects');
    projectsRef.once('value', (snapshot) => {
      const projects = snapshot.val();
      const projectsArray = Object.keys(projects).map(key => ({
        id: key,
        ...projects[key]
      }));
      res.json(projectsArray);
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'An error occurred while fetching the projects' });
  }
});

// Route to fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const usersRef = admin.database().ref('users');
    usersRef.once('value', (snapshot) => {
      const users = snapshot.val();
      const usersArray = Object.keys(users).map(key => ({
        id: key,
        ...users[key]
      }));
      res.json(usersArray);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching the users' });
  }
});

app.get('/api/projects/:projectId', async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const projectRef = admin.database().ref(`projects/${projectId}`);
    projectRef.once('value', snapshot => {
      if (snapshot.exists()) {
        res.status(200).json(snapshot.val());
      } else {
        res.status(404).send('Project not found');
      }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'An error occurred while fetching the project' });
  }
});

// Route for creating a new sprint
app.post('/api/projects/createSprint', async (req, res) => {
  try {
    const { sprintName, projectId, startTime, endTime, velocity } = req.body;
    
    const sprintData = {
      sprintName,
      projectId,
      startTime,
      endTime,
      velocity,
      created_at: new Date().toISOString(),
    };

    const newSprintRef = await admin.database().ref('sprints').push(sprintData);
    
    res.status(200).json({ message: 'Sprint created successfully', sprintId: newSprintRef.key });
  } catch (error) {
    console.error('Error creating sprint:', error);
    res.status(500).json({ error: 'An error occurred while creating the sprint' });
  }
});

// Route for creating a new sprint
app.post('/api/users/updateData', async (req, res) => {
  try {
    const { userID, name, surname, username, email } = req.body;
    
    const updateData = {
      name,
      surname,
      username,
      email,
    };

    //await admin.database().ref('users').update(updateData);
    await admin.database().ref(`users/${userID}`).update(updateData);
    res.status(200).json({ message: 'User profile updated successfully!'});
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'An error occurred while updating user data!' });
  }
});


// Route to fetch sprints by project ID
app.get('/api/sprints/:projectId', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const sprintsRef = admin.database().ref('sprints');
    
    // Query sprints by project ID
    const query = sprintsRef.orderByChild('projectId').equalTo(projectId);

    query.once('value', (snapshot) => {
      const sprints = snapshot.val();
      if (!sprints) {
        return res.json([]); // Return an empty array if no sprints found
      }
      
      const sprintsArray = Object.keys(sprints).map(key => ({
        id: key,
        ...sprints[key]
      }));
      res.json(sprintsArray);
    });
  } catch (error) {
    console.error('Error fetching sprints:', error);
    res.status(500).json({ error: 'An error occurred while fetching the sprints' });
  }
});


// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
