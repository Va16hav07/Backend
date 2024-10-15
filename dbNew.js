const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://vaibhavkota7605:Rs52xX2cnZPwuH9z@cluster0.mug6b.mongodb.net/mydatabase?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

const express = require('express');
const app = express();
const port = 3002;

app.use(express.json());

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dob: { type: Date, required: true }, 
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true }, 
  mobile: { 
    type: String, 
    required: true, 
    match: /^[6-9]\d{9}$/,
    unique: true 
  },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.post('/api/users', async (req, res) => {
  const { firstName, lastName, email, dob, gender, mobile, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const user = new User({ firstName, lastName, email, dob, gender, mobile, password });
    const result = await user.save();
    res.status(201).json(result);
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ message: 'Error saving user data', error });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
