const express = require("express");
const multer = require("multer");
// 🔑 Import the protect middleware
const { protect } = require("../middleware/authMiddleware");
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 🔒 PROTECTED: Only authenticated users can create an event
// 'protect' runs before the file upload middleware
router.post("/", protect, upload.single("file"), createEvent);

// PUBLIC: Anyone can view the list of events
router.get("/", getEvents);

// PUBLIC: Anyone can view a single event
router.get("/:id", getEvent);

// 🔒 PROTECTED: Only authenticated users can update an event
// 'protect' runs before the file upload middleware
router.put("/:id", protect, upload.single("file"), updateEvent);

// 🔒 PROTECTED: Only authenticated users can delete an event
router.delete("/:id", protect, deleteEvent);

module.exports = router;
