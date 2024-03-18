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



// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
