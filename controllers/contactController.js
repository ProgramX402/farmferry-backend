const Contact = require("../models/Contact");
const sgMail = require("@sendgrid/mail");

// Set SendGrid API key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// @desc    Submit contact form
// @route   POST /api/contact
exports.createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Save to MongoDB
    const newContact = new Contact({
      firstName,
      lastName,
      email,
      subject,
      message,
    });
    await newContact.save();

    // Ensure required email config is present
    if (!process.env.ADMIN_EMAIL || !process.env.SENDGRID_API_KEY) {
      console.error("Missing SENDGRID_API_KEY or ADMIN_EMAIL in .env");
      return res.status(500).json({ error: "Email configuration error" });
    }

    // Prepare SendGrid message
    const msg = {
      to: process.env.ADMIN_EMAIL, // your admin email
      from: process.env.EMAIL_USER, // must be verified in SendGrid
      replyTo: email, // allows admin to reply directly to sender
      subject: `New Contact: ${subject}`,
      html: `
        <h2>New Contact Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // Send the email
    await sgMail.send(msg);

    res.status(201).json({ message: "Message received and sent to admin" });
  } catch (err) {
    console.error("SendGrid Contact error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
