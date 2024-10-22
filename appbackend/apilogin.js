const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware to parse incoming JSON data
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.error('MongoDB connection error:', error));

// Define the User schema
const userSchema = new mongoose.Schema({
    countryCode: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
    },
    deviceId: {
        type: String
    }
});

const User = mongoose.model('User', userSchema);

// Login API
app.post('/login', async (req, res) => {
    const { email, password, token, deviceId } = req.body;

    // Input validation
    if (!email || !password) {
        return res.status(400).json({ message: "Please provide all required fields: email and password" });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Email not found" });
        }

        // Validate password
        if (password !== user.password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Successful login
        return res.json({
            message: "Login successful",
            user: {
                email: user.email,
                countryCode: user.countryCode,
                token: token || 'YourTokenHere',  
                deviceId: deviceId
            }
        });
    } catch (error) {
        console.error("Server error:", JSON.stringify(error, null, 2));
        return res.status(500).json({
            message: "Server error",
            error: error.message || "An unknown error occurred"
        });
    }
});

app.get('/', (req, res) => {
    res.send('Welcome to the Login API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
