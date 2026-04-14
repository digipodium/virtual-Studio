import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Feedback', FeedbackSchema);
