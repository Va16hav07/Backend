const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();  // Load .env file

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User schema 
const userSchema = new mongoose.Schema({
    countryCode: String,
    firstName: String,
    lastName: String,
    email: { 
        type: String,
        required: true,
        unique: true,
    },
    mobileNumber: String,
    userToken: String,
    deviceId: String,
});

const User = mongoose.model('User', userSchema);

// Check email endpoint
app.post('/api/check-email', async (req, res) => {
    const { email } = req.body;  

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const existingUser = await User.findOne({
            email: { $regex: new RegExp(`^${email.trim()}$`, 'i') }
        });

        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        res.status(200).json({ message: 'Email does not exist' });
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({ message: 'Error checking email', error: error.message });
    }
});

// Get users data endpoint (returns all users or by query)
app.get('/api/users', async (req, res) => {
    const { email } = req.query;

    try {
        let users;
        if (email) {
            users = await User.find({
                email: { $regex: new RegExp(`^${email.trim()}$`, 'i') }
            });
        } else {
            users = await User.find({});
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
