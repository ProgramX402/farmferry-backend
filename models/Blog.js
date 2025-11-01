const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    mediaUrl: { type: String }, // cloudinary file URL
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);
