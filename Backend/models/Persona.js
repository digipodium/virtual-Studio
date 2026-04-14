import mongoose from 'mongoose';

const PersonaSchema = new mongoose.Schema({
  userId:        { type: String, required: true },
  name:          { type: String, required: true },
  avatarId:      { type: String, required: true },
  voiceId:       { type: String, required: true },
  llmId:         { type: String, default: '0934d97d-0c3a-4f33-91b0-5e136a0ef466' },
  systemPrompt:  { type: String, required: true },
  platform:      { type: String, enum: ['youtube', 'instagram', 'tiktok', 'podcast', 'custom'], default: 'custom' },
  genre:         { type: String, default: '' },
  description:   { type: String, default: '' },
  thumbnailUrl:  { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Persona', PersonaSchema);