// To run: npm install express mongodb body-parser dotenv

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv'); // Import dotenv

// Load environment variables from .env file
dotenv.config();

const app = express();
const uri = process.env.MONGODB_URI; // Use the connection string from .env
const client = new MongoClient(uri);

app.use(bodyParser.json());
app.listen(3001, () => {
  console.log('Server running on port 3001');
});

// API to verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    await client.connect();
    const database = client.db('sweatsmart');
    const otps = database.collection('otps');

    // Find the OTP entry using both email and otp
    const otpEntry = await otps.findOne({ email, otp });

    if (!otpEntry) {
      return res.status(400).json({ success: false, message: 'Invalid OTP or email.' });
    }

    // Check if the OTP is expired
    const currentTime = new Date();
    if (currentTime > otpEntry.expiration) {
      await otps.deleteOne({ email, otp }); // Delete expired OTP
      return res.status(400).json({ success: false, message: 'OTP expired.' });
    }

    // If OTP is valid, delete the OTP entry from the database
    await otps.deleteOne({ email, otp });

    res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error verifying OTP', error: err.message });
  } finally {
    await client.close();
  }
});

// API to get user data by email
app.post('/get-user-data', async (req, res) => {
  const { email } = req.body;

  try {
    await client.connect();
    const database = client.db('sweatsmart');
    const users = database.collection('users');

    // Find the user entry using email
    const userEntry = await users.findOne({ email });

    if (!userEntry) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, data: userEntry });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching user data', error: err.message });
  } finally {
    await client.close();
  }
});
