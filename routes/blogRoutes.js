const express = require("express");
const multer = require("multer");
// 🔑 Import the protect middleware
const { protect } = require("../middleware/authMiddleware"); 
const {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

const router = express.Router();

// multer setup (store in /uploads temporarily)
const upload = multer({ dest: "uploads/" });

// 🔒 PROTECTED: Only authenticated users can create a blog
// 'protect' runs first, then 'upload', then the controller
router.post("/", protect, upload.single("file"), createBlog);

// PUBLIC: Anyone can view the list of blogs
router.get("/", getBlogs);

// PUBLIC: Anyone can view a single blog post
router.get("/:id", getBlog);

// 🔒 PROTECTED: Only authenticated users can update a blog
// 'protect' runs first, then 'upload', then the controller
router.put("/:id", protect, upload.single("file"), updateBlog);

// 🔒 PROTECTED: Only authenticated users can delete a blog
router.delete("/:id", protect, deleteBlog);

module.exports = router;
