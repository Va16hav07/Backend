//npm install express body-parser mongoose


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
    fullName: String,
    emailAddress: {
        type: String,
        required: true, 
        unique: true,   
    },
    mobileNumber: String,
    userToken: String,
    deviceId: String,
});

const User = mongoose.model('User', userSchema);

// Registration endpoint
app.post('/api/register', async (req, res) => {
    const { countryCode, firstName, lastName, fullName, emailAddress, mobileNumber, userToken, deviceId } = req.body;

    // Check if emailAddress is provided
    if (!emailAddress) {
        return res.status(400).json({ message: 'Email address is required' });
    }

    try {
        // Log the incoming email
        console.log("Attempting to register email:", emailAddress);

        // Check if the email already exists 
        const existingUser = await User.findOne({ emailAddress: { $regex: new RegExp(`^${emailAddress.trim()}$`, 'i') } });
        if (existingUser) {
            console.log("Existing user found:", existingUser);
            return res.status(409).json({ message: 'Email address already exists' });
        }

        const newUser = new User({
            countryCode,
            firstName,
            lastName,
            fullName,
            emailAddress,
            mobileNumber,
            userToken,
            deviceId,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email address already exists' });
        }
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
