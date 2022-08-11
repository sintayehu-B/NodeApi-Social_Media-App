const mongoose = require("mongoose");

const PostsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    description: { type: String, maxLength: 500 },
    image: { type: String },
    likes: { type: Array, default: [] },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Posts", PostsSchema);
