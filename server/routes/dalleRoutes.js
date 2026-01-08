const express = require('express');
const cloudinary = require('cloudinary').v2;
const Post = require('../mongodb/models/post.js');
const auth = require('../middleware/auth.js');

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- 1. GENERATE & SAVE IMAGE (Private) ---
router.post('/', auth, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    // AI Generation URL (Pollinations)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
      resource_type: "image",
    });

    // Save to MongoDB with User ID
    const newPost = await Post.create({
      prompt,
      photo: uploadResponse.secure_url,
      user: req.userId, // Linked to logged in user
    });

    res.status(200).json({ photo: newPost.photo });
  } catch (error) {
    console.error("Gen Error:", error);
    res.status(500).json({ message: "Generation failed", error: error.message });
  }
});

// --- 2. GET ALL POSTS (Global Community Gallery) ---
router.get('/gallery', async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    res.status(200).json({ data: posts });
  } catch (error) {
    res.status(500).json({ message: "Fetching gallery failed" });
  }
});

// --- 3. GET USER SPECIFIC POSTS (Private Gallery) ---
router.get('/my-creations', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ message: "Fetching your creations failed" });
  }
});

// --- 4. DELETE A SPECIFIC POST (Secure) ---
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) return res.status(404).json({ message: "Asset not found" });

    // Security: Sirf wahi delete kar sake jisne banaya hai
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized: Access Denied" });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Asset deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;