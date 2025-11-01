const Blog = require("../models/Blog");
const cloudinary = require("cloudinary").v2;

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Create blog
// @route   POST /api/blogs
// @access  Public (can secure later)
exports.createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    let mediaUrl = "";
    let mediaType = "";

    if (req.file) {
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto", // auto-detect image/video
      });
      mediaUrl = uploadRes.secure_url;
      mediaType = uploadRes.resource_type;
    }

    const blog = new Blog({ title, content, mediaUrl, mediaType });
    await blog.save();

    res.status(201).json({ message: "Blog created", blog });
  } catch (err) {
    console.error("Create blog error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get all blogs
// @route   GET /api/blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
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

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.json({ message: "Blog updated", blog });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
