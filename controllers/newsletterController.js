const Subscriber = require("../models/Subscriber");
const cloudinary = require("cloudinary").v2;
const sgMail = require("@sendgrid/mail");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    const exists = await Subscriber.findOne({ email });
    if (exists) return res.status(409).json({ error: "Already subscribed" });

    await new Subscriber({ email }).save();

    // Optional: Send welcome email
    const msg = {
      to: email,
      from: {
        email: process.env.EMAIL_USER, // must be a verified sender in SendGrid
        name: process.env.EMAIL_FROM_NAME || "Orphanage Foundation",
      },
      subject: "Welcome to Our Newsletter!",
      html: `
        <h2>Welcome to Our Family 💙</h2>
        <p>Thank you for subscribing to our newsletter! You'll receive updates on our latest projects, events, and activities.</p>
        <p>– The Orphanage Team</p>
      `,
    };
    await sgMail.send(msg);

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Send newsletter to all subscribers
// @route   POST /api/newsletter/send
exports.sendNewsletter = async (req, res) => {
  try {
    const { title, content } = req.body;

    let fileUrl = "";
    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });
      fileUrl = uploadRes.secure_url;
    }

    const subscribers = await Subscriber.find();
    if (!subscribers.length)
      return res.status(400).json({ error: "No subscribers found" });

    // Prepare SendGrid message
    const msg = {
      to: subscribers.map((s) => s.email),
      from: {
        email: process.env.EMAIL_USER,
        name: process.env.EMAIL_FROM_NAME || "Orphanage Foundation",
      },
      subject: title,
      html: `
        <h2>${title}</h2>
        <p>${content}</p>
        ${fileUrl ? `<p><a href="${fileUrl}">View Attachment</a></p>` : ""}
      `,
    };

    await sgMail.sendMultiple(msg);

    res.json({ message: "Newsletter sent successfully" });
  } catch (err) {
    console.error("Send newsletter error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
