// install  npm install express mongoose bcryptjs

const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb+srv://vaibhavkota7605:Rs52xX2cnZPwuH9z@cluster0.mug6b.mongodb.net/sweatsmart?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

const app = express();
const port = 3002;

// Middleware to parse JSON requests
app.use(express.json());

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  mobile: { 
    type: String, 
    required: true, 
    match: /^[6-9]\d{9}$/, // Ensure mobile starts with 6-9 and is 10 digits
    unique: true 
  },
  password: { type: String, required: true },
  userType: { type: Number, enum: [0, 1], required: true } // 0 = Coach, 1 = Athlete
});

// User Model
const User = mongoose.model('User', userSchema);

// Registration Endpoint
app.post('/api/users', async (req, res) => {
  const { firstName, lastName, email, dob, gender, mobile, password, confirmPassword, userType } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !dob || !gender || !mobile || !password || !confirmPassword || userType === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // Validate userType
  if (![0, 1].includes(userType)) {
    return res.status(400).json({ message: 'Invalid user type. Use 0 for Coach and 1 for Athlete.' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      firstName,
      lastName,
      email,
      dob,
      gender,
      mobile,
      password: hashedPassword,
      userType, // Store the user type
    });

    const result = await user.save();
    res.status(201).json({ message: 'User registered successfully', userId: result._id });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ message: 'Error saving user data', error });
  }
});

// Endpoint to fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude the password from the response
    res.status(200).json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ message: 'Error retrieving users', error });
  }
});

// Endpoint to fetch a single user by email
app.get('/api/users/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email }, '-password'); // Exclude the password from the response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ message: 'Error retrieving user', error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
