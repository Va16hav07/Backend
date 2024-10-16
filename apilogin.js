const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware to parse incoming JSON data
app.use(express.json());

// MongoDB connection
const mongoURI = 'mongodb+srv://vaibhavkota7605:Rs52xX2cnZPwuH9z@cluster0.mug6b.mongodb.net/sweatsmart?retryWrites=true&w=majority';

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
    mobile: {
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
    const { countryCode, mobile, password, token, deviceId } = req.body;

    // Input validation
    if (!countryCode || !mobile || !password) {
        return res.status(400).json({ message: "Please provide all required fields: countryCode, mobile, and password" });
    }

    try {
        // Find user by mobile number and country code
        const user = await User.findOne({ mobile, countryCode });

        if (!user) {
            return res.status(401).json({ message: "Mobile number or country code not found" });
        }

        // Validate password
        if (password !== user.password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Successful login
        return res.json({
            message: "Login successful",
            user: {
                mobile: user.mobile,
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

const PORT = 3000;  
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
