const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  photo: { type: String, required: true }, // Cloudinary Secure URL
  // NEW: User reference add kiya hai
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Post', PostSchema);