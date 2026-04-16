import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/UserModel.js';
import Feedback from '../models/FeedbackModel.js';
import auth from '../controller/auth.js';

const router = express.Router();

// ── Nodemailer — auto transporter ──────────────────────────────────────────────
// Agar .env mein real email credentials hain toh Gmail use karo
// Warna Ethereal (test) account auto-banakar use karo — koi config ki zaroorat nahi
async function getTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS &&
      !process.env.EMAIL_USER.includes('your_actual')) {
    // Real Gmail / SMTP
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Ethereal — auto-creates a free test account
  const testAccount = await nodemailer.createTestAccount();
  console.log('\n📧 Ethereal test account created:');
  console.log('   User:', testAccount.user);
  console.log('   Pass:', testAccount.pass);
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}


// @route   POST /api/users/signup
router.post('/signup', async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // 🔒 Trim inputs to avoid whitespace issues
    name = name?.trim() || '';
    email = email?.trim().toLowerCase() || '';
    password = password?.trim() || '';

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please enter all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'Signup successful',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    // 🔒 Trim inputs to avoid whitespace issues
    email = email?.trim().toLowerCase() || '';
    password = password?.trim() || '';

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid credentials - user not found' });
    }

    // 🔐 Compare password (bcrypt will handle the hashed password)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error(`Login failed for ${email}: password mismatch`);
      return res.status(400).json({ success: false, error: 'Invalid credentials - wrong password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/users/forgot-password  — sends OTP to email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account found with that email' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send email using auto-transporter
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: '"AI Avatar" <noreply@aiavatar.app>',
      to: email,
      subject: 'Your Password Reset OTP',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#f8f9fc;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#00c8f5,#0077ff);padding:32px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:28px;">🔐 Password Reset</h1>
          </div>
          <div style="padding:32px;">
            <p style="color:#333;font-size:16px;">Hi <strong>${user.name}</strong>,</p>
            <p style="color:#555;">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
            <div style="background:white;border:2px dashed #00c8f5;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
              <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#00c8f5;">${otp}</span>
            </div>
            <p style="color:#999;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    // Ethereal preview URL — console mein dikho (testing ke liye)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n✅ OTP EMAIL SENT (Test Mode)');
      console.log('📬 Preview URL (browser mein kholo):', previewUrl);
      console.log('🔑 OTP:', otp);
    }

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/users/verify-otp  — verifies OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (new Date() > user.resetPasswordExpires) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    res.json({ success: true, message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/users/reset-password  — resets password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (new Date() > user.resetPasswordExpires) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/users/save-video
router.post('/save-video', auth, async (req, res) => {
  try {
    const { name, url } = req.body;
    if (!url) return res.status(400).json({ error: 'Video URL is required' });

    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.videos.push({ name: name || 'AI Video', url });
    await user.save();

    res.json({ success: true, videos: user.videos });
  } catch (err) {
    console.error('Save video error:', err);
    res.status(500).json({ success: false, error: 'Error saving video', details: err.message });
  }
});

// @route   GET /api/users/videos
router.get('/videos', auth, async (req, res) => {
  console.log('--- FETCH VIDEOS ATTEMPT ---');
  console.log('User ID from token:', req.user);
  
  try {
    const user = await User.findById(req.user).select('videos');
    console.log('User found in DB:', !!user);
    
    if (!user) {
      console.warn('User document not found for ID:', req.user);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const videoList = user.videos || [];
    console.log('Videos found count:', videoList.length);
    
    return res.json({ 
      success: true, 
      videos: videoList,
      count: videoList.length
    });

  } catch (err) {
    console.error('CRITICAL DATABASE ERROR IN FETCH VIDEOS:', err.message);
    console.error(err.stack);
    
    return res.status(500).json({ 
      success: false, 
      error: 'Database fetch failure', 
      details: err.message,
      videos: [] // Safe fallback for UI
    });
  }
});
// add


// @route   POST /api/users/feedback (NO AUTH REQUIRED)
router.post('/feedback', async (req, res) => {
  try {
    const { userId, userName, rating, message, comment } = req.body;
    
    if (!rating) return res.status(400).json({ error: 'Rating is required' });
    if (!message && !comment) return res.status(400).json({ error: 'Message or comment is required' });

    const newFeedback = new Feedback({
      userId: userId || 'anonymous',
      rating,
      message: message || comment || '',
    });
    await newFeedback.save();

    res.status(201).json({ success: true, feedback: newFeedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/users/feedback
router.get('/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('userId', 'name').sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/users/create-admin — Create admin user (for setup only)
router.post('/create-admin', async (req, res) => {
  try {
    const adminEmail = 'admin2@gmail.com';
    const adminPassword = 'Admin@1234';
    const adminName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      return res.status(400).json({ 
        error: 'Admin user already exists',
        message: `Login with email: ${adminEmail} and password: ${adminPassword}`
      });
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    const savedAdmin = await adminUser.save();

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        email: adminEmail,
        password: adminPassword,
        name: adminName
      },
      user: {
        id: savedAdmin._id,
        name: savedAdmin.name,
        email: savedAdmin.email,
        role: savedAdmin.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;