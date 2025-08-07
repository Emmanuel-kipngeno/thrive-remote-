const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const cors = require('cors');


// Middleware
app.use(cors());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Email configuration
const transporter = nodemailer.createTransport({
  host: "mx4125.usc1.mymailhosting.com", // your SMTP server
  port: 587, // try 465 for SSL or 25 if 587 doesn't work
  secure: false, // true for port 465, false for 587
  auth: {
    user: "admin@thrive-remote.com",
    pass: "jeJxf@Y9GtrSChN",
  },
});


// Handle POST
app.post("/send", (req, res) => {
  const { name, email, subject, message } = req.body;

  // Simple validation
  if (!name || !email || !message || !email.includes("@")) {
    return res.status(400).send("Please complete the form and provide a valid email.");
  }

const mailOptions = {
  from: "admin@thrive-remote.com",
  to: "admin@thrive-remote.com",
  replyTo: email,
  subject: subject || "Contact Form Submission",
  text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
};


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Oops! Something went wrong and we couldn’t send your message.");
    }
    res.status(200).send("Thank you! Your message has been sent.");
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
