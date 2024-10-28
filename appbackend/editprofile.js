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
  countryCode: { type: String, required: true }, // Field for country code
  password: { type: String, required: true },
  userType: { type: Number, enum: [0, 1], required: true } // 0 = Coach, 1 = Athlete
});

// User Model
const User = mongoose.model('User', userSchema);

// Registration Endpoint
app.post('/api/users', async (req, res) => {
  const { firstName, lastName, email, dob, gender, mobile, countryCode, password, confirmPassword, userType } = req.body;

  if (!firstName || !lastName || !email || !dob || !gender || !mobile || !countryCode || !password || !confirmPassword || userType === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (![0, 1].includes(userType)) {
    return res.status(400).json({ message: 'Invalid user type. Use 0 for Coach and 1 for Athlete.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      dob,
      gender,
      mobile,
      countryCode,
      password: hashedPassword,
      userType,
    });

    const result = await user.save();
    res.status(201).json({ message: 'User registered successfully', userId: result._id });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ message: 'Error saving user data', error });
  }
});

// Update User Endpoint
app.put('/api/users/:email', async (req, res) => {
  const { email } = req.params;
  const { firstName, lastName, dob, mobile, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Check if the new firstName, lastName, or mobile is the same as the current values
    if (firstName && firstName === user.firstName) {
      return res.status(400).json({ message: 'New first name cannot be the same as the current first name' });
    }
    if (lastName && lastName === user.lastName) {
      return res.status(400).json({ message: 'New last name cannot be the same as the current last name' });
    }
    if (mobile && mobile === user.mobile) {
      return res.status(400).json({ message: 'New mobile number cannot be the same as the current mobile number' });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (dob) user.dob = dob;
    if (mobile) user.mobile = mobile;

    // Change password if a new password is provided
    if (newPassword) {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword; // Update the password
    }

    await user.save();
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Error updating user data', error });
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
