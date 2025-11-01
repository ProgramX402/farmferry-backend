const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware"); // Import the middleware
const { subscribe, sendNewsletter } = require("../controllers/newsletterController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// PUBLIC: subscribe route - Anyone can subscribe, so this is public.
router.post("/subscribe", subscribe);

// 🔒 PROTECTED: send newsletter route (with optional file)
// Only authenticated staff should be allowed to send bulk newsletters.
// 'protect' runs before the file upload middleware.
router.post("/send", protect, upload.single("file"), sendNewsletter);

module.exports = router;
