const Project = require("../models/Project");
const cloudinary = require("cloudinary").v2;

// cloudinary config (reuse env variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Create project
// @route   POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { title, content } = req.body;
    let mediaUrl = "";
    let mediaType = "";

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });
      mediaUrl = uploadRes.secure_url;
      mediaType = uploadRes.resource_type;
    }

    const project = new Project({
      title,
      content,
      mediaUrl,
      mediaType,
    });

    await project.save();
    res.status(201).json({ message: "Project created", project });
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const { title, content } = req.body;
    let updateData = { title, content };

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });
      updateData.mediaUrl = uploadRes.secure_url;
      updateData.mediaType = uploadRes.resource_type;
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    res.json({ message: "Project updated", project });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
