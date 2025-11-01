const express = require("express");
const multer = require("multer");
// 🔑 Import the protect middleware
const { protect } = require("../middleware/authMiddleware");
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 🔒 PROTECTED: Only authenticated users can create a project
router.post("/", protect, upload.single("file"), createProject);

// PUBLIC: Anyone can view the list of projects
router.get("/", getProjects);

// PUBLIC: Anyone can view a single project
router.get("/:id", getProject);

// 🔒 PROTECTED: Only authenticated users can update a project
router.put("/:id", protect, upload.single("file"), updateProject);

// 🔒 PROTECTED: Only authenticated users can delete a project
router.delete("/:id", protect, deleteProject);

module.exports = router;
