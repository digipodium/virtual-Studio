import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    userName: {
      type: String,
      default: 'Unknown',
    },

    userEmail: {
      type: String,
      default: 'Unknown',
    },

    // Action type
    action: {
      type: String,
      required: true,
    },

    // Description
    description: {
      type: String,
      default: '',
    },

    // Video Info
    videoTitle: {
      type: String,
      default: '',
    },

    videoUrl: {
      type: String,
      default: '',
    },

    // 🔥 IMPORTANT
    prompt: {
      type: String,
      default: '',
    },

    // Status
    status: {
      type: String,
      enum: ['success', 'pending', 'failed'],
      default: 'success',
    },

    // Time
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Activity', ActivitySchema);