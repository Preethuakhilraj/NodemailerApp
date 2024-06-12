const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/send-email', upload.array('attachments'), async (req, res) => {
  const { to, from, subject, text } = req.body;
  const recipients = Array.isArray(to) ? to : [to];
  const attachments = req.files ? req.files.map(file => ({
    filename: file.originalname,
    path: file.path
  })) : [];

  try {
    const info = await transporter.sendMail({
      from: from,
      to: recipients.join(', '),
      subject: subject,
      text: text,
      attachments: attachments,
    });

    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email.' });
  } finally {

    req.files && req.files.forEach(file => fs.unlinkSync(file.path));
  }
});
const port = process.env.PORT || 3000;
app.listen(port, (err) => {
  if (err) {
    return console.error(`Failed to start server: ${err.message}`);
  }
  console.log(`Server is listening on port ${port}`);
});

