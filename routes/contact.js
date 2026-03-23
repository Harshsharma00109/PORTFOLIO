const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Message = require('../models/message');

// ✅ POST route
router.post('/', async (req, res) => {
  console.log("📩 Incoming request:", req.body);

  const { name, email, message } = req.body;

  // ✅ Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'All fields required'
    });
  }

  try {
    // ✅ Save to DB
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    console.log("✅ Saved to MongoDB");

    // ✅ Nodemailer (OPTIONAL - safe)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // ⚠️ OPTIONAL: Uncomment if needed
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      text: message
    });
    

    console.log("✅ Process completed");

    // ✅ VERY IMPORTANT (response must always be sent)
    return res.status(200).json({
      success: true,
      msg: "Message sent successfully"
    });

  } catch (err) {
    console.error("❌ Server error:", err);

    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

module.exports = router;