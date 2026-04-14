import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, default: 'Unknown' },
  userEmail: { type: String, default: 'Unknown' },
  action: { type: String, required: true }, // 'video_created', 'feedback_submitted', 'login', etc.
  description: { type: String, default: '' },
  videoTitle: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
}, { timestamps: true });

export default mongoose.model('Activity', ActivitySchema);
