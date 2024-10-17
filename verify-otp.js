// To run: npm install express mongodb body-parser

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const app = express();
const uri = 'mongodb+srv://vaibhavkota7605:Rs52xX2cnZPwuH9z@cluster0.mug6b.mongodb.net/sweatsmart?retryWrites=true&w=majority';
const client = new MongoClient(uri);

app.use(bodyParser.json());
app.listen(3001, () => {
  console.log('Server running on port 3001');
});

// API to verify OTP
app.post('/verify-otp', async (req, res) => {
    const { emailAddress, otp } = req.body; 
  
    try {
      await client.connect();
      const database = client.db('sweatsmart');
      const otps = database.collection('otps');
  
      // Find the OTP entry using both emailAddress and otp
      const otpEntry = await otps.findOne({ emailAddress, otp });
  
      if (!otpEntry) {
        return res.status(400).json({ success: false, message: 'Invalid OTP or email.' });
      }
  
      // Check if the OTP is expired
      const currentTime = new Date();
      if (currentTime > otpEntry.expiration) {
        await otps.deleteOne({ emailAddress, otp }); // Delete expired OTP
        return res.status(400).json({ success: false, message: 'OTP expired.' });
      }
  
      // If OTP is valid, delete the OTP entry from the database
      await otps.deleteOne({ emailAddress, otp }); 
  
      res.json({ success: true, message: 'OTP verified successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error verifying OTP', error: err.message });
    } finally {
      await client.close();
    }
  });
