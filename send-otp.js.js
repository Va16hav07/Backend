// To run: npm install express mongodb nodemailer body-parser

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const crypto = require('crypto'); 
const nodemailer = require('nodemailer'); 
const app = express();
const uri = 'mongodb+srv://vaibhavkota7605:Rs52xX2cnZPwuH9z@cluster0.mug6b.mongodb.net/sweatsmart?retryWrites=true&w=majority';
const client = new MongoClient(uri);

app.use(bodyParser.json());
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// API to send OTP
app.post('/send-otp', async (req, res) => {
    const { emailAddress } = req.body; 
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate OTP
  
    try {
      await client.connect();
      const database = client.db('sweatsmart');
      const otps = database.collection('otps');
  
      // Store OTP and expiration time in MongoDB
      const expiration = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
      await otps.insertOne({ emailAddress, otp, expiration });
  
      // Send OTP via email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sweatsmartoffical@gmail.com', 
          pass: 'ycqj hcju ghsd xhsn', 
        },
      });
  
      const mailOptions = {
        from: 'sweatsmartoffical@gmail.com',
        to: emailAddress,
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
