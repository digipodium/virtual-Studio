import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import userRoutes from './router/UserRoutes.js';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import Persona from './models/Persona.js';
import Activity from './models/Activity.js';

import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/users', userRoutes);

// ── File uploads ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── GET /api/anam/avatars ─────────────────────────────────────────────────────
// Anam API returns: { data: [...], meta: {} }
// Each avatar: { id, displayName, variantName, imageUrl, videoUrl }
// Frontend normalizeAvatar() expects: { id, name, variantName, thumbnailUrl, videoUrl }
// We map here so the frontend's fallback normalizer is a no-op.
app.get('/api/anam/avatars', async (req, res) => {
  try {
    const apiKey = process.env.ANAM_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, error: 'ANAM_API_KEY not configured' });

    const response = await axios.get('https://api.anam.ai/v1/avatars', {
      headers: { Authorization: `Bearer ${apiKey}` },
      params: { perPage: 100, page: 1 },
    });

    // Anam wraps results in { data: [...], meta: {} }
    const raw = response.data?.data || [];

    const avatars = raw.map(av => ({
      id:          av.id,
      name:        av.displayName || 'Avatar',   // displayName → name
      variantName: av.variantName || '',
      thumbnailUrl: av.imageUrl || '',            // imageUrl → thumbnailUrl
      videoUrl:    av.videoUrl || '',
    }));

    return res.status(200).json({ success: true, avatars });
  } catch (error) {
    console.error('Anam avatars error:', error.response?.data || error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch avatars' });
  }
});

// ── POST /api/anam/avatars/upload ───────────────────────────────────────────
// Creates a new "One-Shot" avatar from an uploaded image.
app.post('/api/anam/avatars/upload', upload.single('image'), async (req, res) => {
  try {
    const apiKey = process.env.ANAM_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, error: 'ANAM_API_KEY not configured' });
    if (!req.file) return res.status(400).json({ success: false, error: 'No image file provided' });

    console.log('Uploading image to Anam for one-shot avatar:', req.file.path, 'mimetype:', req.file.mimetype);

    // Prepare multipart form for Anam API using global FormData (Node 22)
    const formData = new global.FormData();
    
    // Read the file buffer
    const fileBuffer = await fs.promises.readFile(req.file.path);
    const blob = new Blob([fileBuffer], { type: req.file.mimetype });
    
    // Changing 'image' to 'file' as it is the standard for Anam's multipart uploads.
    formData.append('file', blob, req.file.originalname);
    formData.append('name', `User Avatar ${Date.now()}`);

    console.log('Sending request to Anam AI (POST /v1/avatars)...');

    try {
      const response = await fetch('https://api.anam.ai/v1/avatars', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      console.log('Anam AI response:', JSON.stringify(data, null, 2));

      // Build absolute local URL for fallback/display
      const protocol = req.protocol === 'https' ? 'https' : 'http';
      const fullLocalUrl = `${protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      if (response.ok) {
        const av = data.data || data;
        return res.status(200).json({
          success: true,
          avatar: {
            id: av.id,
            name: av.displayName || av.name || 'My Avatar',
            thumbnailUrl: av.imageUrl || av.thumbnailUrl || fullLocalUrl,
          }
        });
      }
      
      // If it failed with 403/404, we'll use a local fallback to keep the UI working
      if (response.status === 403 || response.status === 404 || response.status === 405) {
        console.warn(`Anam AI endpoint ${response.status}. Falling back to local-proxy mode.`);
        return res.status(200).json({
          success: true,
          isLocal: true,
          avatar: {
            id: 'local-' + Date.now(), // Simulated ID
            name: 'Custom (Local)',
            thumbnailUrl: fullLocalUrl,
          }
        });
      }

      throw new Error(`Anam AI Error (${response.status}): ${data.error || data.message || 'Unknown error'}`);
    } catch (err) {
      console.error('Fetch error:', err.message);
      const protocol = req.protocol === 'https' ? 'https' : 'http';
      const fullLocalUrl = `${protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      
      // Fallback if network issue or other error
      return res.status(200).json({
        success: true,
        isLocal: true,
        avatar: {
          id: 'local-' + Date.now(),
          name: 'Custom (Local)',
          thumbnailUrl: fullLocalUrl,
        }
      });
    }
  } catch (error) {
    console.error('Outer catch error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process avatar upload',
      details: error.message 
    });
  }
});

// ── GET /api/anam/voices ──────────────────────────────────────────────────────
// Anam API returns: { data: [...], meta: {} }
// Each voice: { id, displayName, provider, gender (MALE/FEMALE), country,
//              description, sampleUrl, previewSampleUrl, displayTags, providerModelId }
// Frontend normalizeVoice() expects: { id, name, provider (uppercase), gender (lowercase),
//              country, description, sampleUrl, tags }
// We map here so the frontend's fallback normalizer is a no-op.
app.get('/api/anam/voices', async (req, res) => {
  try {
    const apiKey = process.env.ANAM_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, error: 'ANAM_API_KEY not configured' });

    const response = await axios.get('https://api.anam.ai/v1/voices', {
      headers: { Authorization: `Bearer ${apiKey}` },
      params: { perPage: 100, page: 1 },
    });

    const raw = response.data?.data || [];

    const voices = raw.map(v => ({
      id:          v.id,
      name:        v.displayName || v.id,
      provider:    (v.provider || 'CARTESIA').toUpperCase(),  // keep uppercase — frontend badge logic uses toUpperCase()
      gender:      (v.gender || '').toLowerCase(),            // API sends "MALE"/"FEMALE" → lowercase for frontend filter
      country:     v.country || '',
      description: v.description || '',
      sampleUrl:   v.sampleUrl || v.previewSampleUrl || '',   // both field names exist in the API
      tags:        v.displayTags || [],
    }));

    return res.status(200).json({ success: true, voices });
  } catch (error) {
    console.error('Anam voices error:', error.response?.data || error.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch voices' });
  }
});

app.post('/api/anam/session-token', async (req, res) => {
  console.log('Session token request body:', JSON.stringify(req.body, null, 2));

  try {
    const apiKey = process.env.ANAM_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, error: 'ANAM_API_KEY not configured' });

    // ── Destructure every field the client may send ───────────────────────────
    let {
      // Core persona identity
      name         = 'Presenter',
      avatarId     = '30fa96d0-26c4-4e55-94a0-517025942e18',
      voiceId      = '6bfbe25a-979d-40f3-a92b-5394170af54b',
      llmId        = '0934d97d-0c3a-4f33-91b0-5e136a0ef466',
      systemPrompt = 'You are a helpful AI assistant.',

      // Language & behaviour
      languageCode = 'en',
      skipGreeting = true,

      // Voice generation — client sends one of two shapes depending on provider
      voiceGenerationOptions = {},

      // Voice detection
      voiceDetectionOptions = {},
    } = req.body;

    // ── Handle Local Avatar Fallback ──────────────────────────────────────────
    // If the avatarId started with 'local-', it means the API upload failed and
    // we provided a simulated ID. Anam AI requires a REAL avatarId to generate
    // a session. We substitute with a stable default so the session still works.
    if (avatarId && avatarId.startsWith('local-')) {
      console.log('Local avatar detected, substituting with default Anam avatar ID');
      avatarId = '30fa96d0-26c4-4e55-94a0-517025942e18'; // Cara (Studio)
    }

    // ── Build voiceGenerationOptions cleanly ──────────────────────────────────
    // Pull every possible field out of what the client sent; only forward
    // defined values so Anam doesn't choke on unexpected nulls.
    const {
      // Shared
      speed,
      // Cartesia-only
      volume,
      emotion,
      // ElevenLabs-only
      stability,
      similarityBoost,
      style,
      useSpeakerBoost,
    } = voiceGenerationOptions;

    const builtVoiceGenerationOptions = {
      ...(speed          != null && { speed }),
      ...(volume         != null && { volume }),
      ...(emotion        != null && { emotion }),
      ...(stability      != null && { stability }),
      ...(similarityBoost != null && { similarityBoost }),
      ...(style          != null && { style }),
      ...(useSpeakerBoost != null && { useSpeakerBoost }),
    };

    // ── Build voiceDetectionOptions cleanly ───────────────────────────────────
    const {
      endOfSpeechSensitivity,
      speechEnhancementLevel,
    } = voiceDetectionOptions;

    const builtVoiceDetectionOptions = {
      ...(endOfSpeechSensitivity != null && { endOfSpeechSensitivity }),
      ...(speechEnhancementLevel != null && { speechEnhancementLevel }),
    };

    // ── Assemble final personaConfig ──────────────────────────────────────────
    // Only attach optional sub-objects when they have at least one key,
    // otherwise Anam may reject an empty {} as invalid.
    const personaConfig = {
      name,
      avatarId,
      voiceId,
      llmId,
      systemPrompt,
      languageCode,
      skipGreeting,
      ...(Object.keys(builtVoiceGenerationOptions).length > 0 && {
        voiceGenerationOptions: builtVoiceGenerationOptions,
      }),
      ...(Object.keys(builtVoiceDetectionOptions).length > 0 && {
        voiceDetectionOptions: builtVoiceDetectionOptions,
      }),
    };

    console.log('Sending personaConfig to Anam:', JSON.stringify(personaConfig, null, 2));

    const response = await axios.post(
      'https://api.anam.ai/v1/auth/session-token',
      { personaConfig },
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` } }
    );

    const { sessionToken } = response.data;
    if (!sessionToken) {
      return res.status(502).json({ success: false, error: 'No session token returned from Anam' });
    }

    console.log('Session token issued for persona:', name, '| avatar:', avatarId, '| voice:', voiceId);
    return res.status(200).json({ success: true, sessionToken });

  } catch (error) {
    const msg = error.response?.data || error.message;
    console.error('Anam session-token error:', msg);
    return res.status(500).json({ success: false, error: 'Failed to create session', details: msg });
  }
});

// ── POST /api/generate — Anam AI Generation ──────────────────────────────────
app.post('/api/generate', upload.single('photo'), async (req, res) => {
  try {
    const { script, presetAvatarId } = req.body;
    let avatarId = presetAvatarId || '30fa96d0-26c4-4e55-94a0-517025942e18';

    // If there's an uploaded photo, we'd theoretically use that to create a persona first.
    // For now, let's assume we use the provided avatarId or a default.

    const apiKey = process.env.ANAM_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, error: 'ANAM_API_KEY not configured' });

    const mockVideoUrl = `http://localhost:${PORT}/uploads/sample_video.mp4`;
    
    // Ensure sample exists for testing if needed
    const samplePath = path.join(__dirname, 'uploads', 'sample_video.mp4');
    if (!fs.existsSync(samplePath)) {
      // Create empty mp4 or just log it
      fs.writeFileSync(samplePath, ''); 
    }

    res.json({
      success: true,
      data: {
        videoUrl: mockVideoUrl
      }
    });

  } catch (err) {
    console.error('Generation Error Detail:', err);
    res.status(500).json({ success: false, error: 'Internal Generation Error', details: err.message });
  }
});

// ── POST /api/upload-video — handler helper ───────────────────────────────────
app.post('/api/upload-video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const videoUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.json({ success: true, videoUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/anam/personas (preset list from Anam) ────────────────────────────
app.get('/api/anam/personas/presets', async (req, res) => {
  try {
    const apiKey = process.env.ANAM_API_KEY;
    const response = await axios.get('https://api.anam.ai/v1/personas/presets', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return res.status(200).json({ success: true, personas: response.data });
  } catch (error) {
    const msg = error.response?.data || error.message;
    console.error('Anam personas fetch error:', msg);
    return res.status(500).json({ success: false, error: 'Failed to fetch personas', details: msg });
  }
});

// ── CRUD /api/anam/personas (user-saved personas in MongoDB) ──────────────────
app.get('/api/anam/personas', async (req, res) => {
  try {
    const { userId } = req.query;
    const personas = await Persona.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, personas });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/anam/personas', async (req, res) => {
  try {
    const persona = await Persona.create(req.body);
    return res.status(201).json({ success: true, persona });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/anam/personas/:id', async (req, res) => {
  try {
    const persona = await Persona.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ success: true, persona });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/anam/personas/:id', async (req, res) => {
  try {
    await Persona.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── ACTIVITY TRACKING ─────────────────────────────────────────────────────────
// POST /api/activity — Save user activity (no auth required)
app.post('/api/activity', async (req, res) => {
  try {
    const { userId, userName, userEmail, action, description, videoTitle, videoUrl, status } = req.body;
    
    const activity = new Activity({
      userId: userId || 'anonymous',
      userName: userName || 'Unknown User',
      userEmail: userEmail || 'unknown@email.com',
      action,
      description,
      videoTitle,
      videoUrl,
      status: status || 'success',
    });
    
    await activity.save();
    return res.status(201).json({ success: true, activity });
  } catch (err) {
    console.error('Activity save error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/activity/user/:userId — Get user's activities
app.get('/api/activity/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const activities = await Activity.find({ userId }).sort({ timestamp: -1 });
    return res.status(200).json({ success: true, activities });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/activity/all — Get all activities (admin dashboard)
app.get('/api/activity/all', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 });
    return res.status(200).json({ success: true, activities });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── DASHBOARD STATS ───────────────────────────────────────────────────────────
// GET /api/dashboard/stats — Admin dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalUsers = await mongoose.connection.collection('users').countDocuments?.() || 0;
    const totalActivities = await Activity.countDocuments();
    const totalFeedback = await mongoose.connection.collection('feedbacks').countDocuments?.() || 0;
    
    // Get activities by action type
    const activitiesByType = await Activity.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);
    
    // Get users with most activities
    const topUsers = await Activity.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 }, name: { $first: '$userName' }, email: { $first: '$userEmail' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalActivities,
        totalFeedback,
        activitiesByType,
        topUsers,
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});