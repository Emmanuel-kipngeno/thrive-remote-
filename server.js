const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 3000;

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (your HTML, assets, forms, etc.)
app.use(express.static(__dirname));

// ===== Multer storage config (stores uploads in /uploads) =====
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});
const upload = multer({ storage });

// ===== Email configuration =====
const transporter = nodemailer.createTransport({
  host: "mx4125.usc1.mymailhosting.com", // your SMTP server
  port: 587,
  secure: false,
  auth: {
    user: "admin@thrive-remote.com",
    pass: "jeJxf@Y9GtrSChN", // ⚠️ use env variable in production
  },
});

// ===== Jobs Storage =====
const jobsFile = path.join(__dirname, "jobs.json");
let jobs = {
  "Virtual Assistant": { capacity: 1, applications: 0, active: true },
  "Data Scientist": { capacity: 1, applications: 0, active: true },
  "Web Developer": { capacity: 1, applications: 0, active: true },
};

if (fs.existsSync(jobsFile)) {
  try {
    jobs = JSON.parse(fs.readFileSync(jobsFile, "utf-8"));
  } catch (err) {
    console.error("Error reading jobs.json:", err);
  }
}

function saveJobs() {
  fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2));
}

// ===== Routes =====

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Apply page
app.get("/apply.html", (req, res) => {
  res.sendFile(path.join(__dirname, "apply.html"));
});

// ===== Contact Form Route =====
app.post("/send", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message || !email.includes("@")) {
    return res.status(400).json({ message: "Please complete the form and provide a valid email." });
  }

  const mailOptions = {
    from: "admin@thrive-remote.com",
    to: "admin@thrive-remote.com",
    replyTo: email,
    subject: subject || "Contact Form Submission",
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  };

  // Send to admin
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error("Contact form error:", error);
      return res.status(500).json({ message: "Oops! Something went wrong and we couldn’t send your message." });
    }

    // Auto-reply to sender
    const autoReply = {
      from: "admin@thrive-remote.com",
      to: email,
      subject: "We’ve received your message",
      text: `Hi ${name},\n\nThank you for contacting Thrive Remote. We’ve received your message and will get back to you shortly.\n\nBest regards,\nThrive Remote Team`,
    };
    transporter.sendMail(autoReply, (err) => {
      if (err) console.error("Auto-reply error:", err);
    });

    res.json({ message: "✅ Thank you! Your message has been sent." });
  });
});

// ===== Job Application Route =====
app.post("/apply", upload.single("resume"), (req, res) => {
  const { name, email, jobTitle, message } = req.body;
  const resume = req.file;

  if (!name || !email || !jobTitle || !message || !resume) {
    return res.status(400).json({ message: "Please complete all fields and upload your resume." });
  }

  if (!jobs[jobTitle]) {
    return res.status(400).json({ message: "Invalid job title." });
  }

  if (!jobs[jobTitle].active || jobs[jobTitle].applications >= jobs[jobTitle].capacity) {
    return res.status(400).json({ message: `❌ The ${jobTitle} position is no longer accepting applications.` });
  }

  jobs[jobTitle].applications += 1;
  if (jobs[jobTitle].applications >= jobs[jobTitle].capacity) {
    jobs[jobTitle].active = false;
  }
  saveJobs();

  const mailOptions = {
    from: "admin@thrive-remote.com",
    to: "admin@thrive-remote.com",
    replyTo: email,
    subject: `Job Application: ${jobTitle}`,
    text: `New job application received:\n\nName: ${name}\nEmail: ${email}\nJob Title: ${jobTitle}\n\nMessage:\n${message}`,
    attachments: [
      {
        filename: resume.originalname,
        path: resume.path,
      },
    ],
  };

  // Send to admin
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error("Application error:", error);
      return res.status(500).json({ message: "Error sending application. Please try again later." });
    }

    // Auto-reply to applicant
    const autoReply = {
      from: "admin@thrive-remote.com",
      to: email,
      subject: `Your Application for ${jobTitle}`,
      text: `Hi ${name},\n\nThank you for applying for the ${jobTitle} position at Thrive Remote. We’ve received your application and our team will review it shortly.\n\nBest regards,\nThrive Remote Recruitment Team`,
    };
    transporter.sendMail(autoReply, (err) => {
      if (err) console.error("Auto-reply error:", err);
    });

    res.json({ message: "✅ Your application has been submitted successfully!" });
  });
});

// ===== Start Server =====
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
