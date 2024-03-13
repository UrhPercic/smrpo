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
    
    // Process the form data (e.g., save project data to database)
    // You can use Firebase Admin SDK or any other database library here
    const newProjectRef = await admin.database().ref('projects').push({
      name,
      description,
      users
    });
    
    // Send success response
    res.status(200).json({ message: 'Project created successfully', projectId: newProjectRef.key });
  } catch (error) {
    console.error('Error creating project:', error);
    // Send error response
    res.status(500).json({ error: 'An error occurred while creating the project' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
