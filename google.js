

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://vaibhavkota7605:Rs52xX2cnZPwuH9z@cluster0.mug6b.mongodb.net/sweatsmart?retryWrites=true&w=majority')
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

    // Validate input
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Check if the email already exists
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
