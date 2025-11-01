const Event = require("../models/Event");
const cloudinary = require("cloudinary").v2;

// cloudinary config (already in blogController, but safe to reuse here)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Create event
// @route   POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    let mediaUrl = "";
    let mediaType = "";

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });
      mediaUrl = uploadRes.secure_url;
      mediaType = uploadRes.resource_type;
    }

    const event = new Event({
      title,
      description,
      date,
      location,
      mediaUrl,
      mediaType,
    });

    await event.save();
    res.status(201).json({ message: "Event created", event });
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get all events
// @route   GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    let updateData = { title, description, date, location };

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });
      updateData.mediaUrl = uploadRes.secure_url;
      updateData.mediaType = uploadRes.resource_type;
    }

    const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!event) return res.status(404).json({ error: "Event not found" });

    res.json({ message: "Event updated", event });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
