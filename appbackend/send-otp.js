// To run: npm install express mongodb nodemailer body-parser cors dotenv

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const crypto = require('crypto'); 
const nodemailer = require('nodemailer'); 
const cors = require('cors'); // Import CORS
const dotenv = require('dotenv'); // Import dotenv

dotenv.config(); // Load environment variables from .env file

const app = express();
const client = new MongoClient(process.env.MONGODB_URI); // Use the MongoDB URI from .env

app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.listen(3005, () => { // Changed port to 3005
  console.log('Server running on port 3005');
});

// API to send OTP
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;  // Use 'email' instead of 'emailAddress'
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate OTP
  
    try {
      await client.connect();
      const database = client.db('sweatsmart');
      const otps = database.collection('otps');
  
      // Store OTP and expiration time in MongoDB
      const expiration = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
      await otps.insertOne({ email, otp, expiration }); // Store with 'email'
  
      // Send OTP via email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Use email from .env
          pass: process.env.EMAIL_PASS, // Use password from .env
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email, // Use 'email' instead of 'emailAddress'
        subject: 'Your OTP for Verification',
        text: `Dear User,

  Your One-Time Password (OTP) for verification is:
  
  OTP: ${otp}
  (Valid for 5 minutes)
  
  Please enter this OTP to complete your verification process. If you did not request this, please disregard this email.
  For any assistance, feel free to contact us.
  Best,
  Team Sweat Smart`,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({ success: true, message: 'OTP sent successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error sending OTP', error: err.message });
    } finally {
      await client.close();
    }
});
