import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import User from '../models/UserModel.js';
import Feedback from '../models/FeedbackModel.js';
import Activity from '../models/Activity.js';

import auth from '../controller/auth.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// ADMIN MIDDLEWARE
// ─────────────────────────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, error: 'Access denied: Admin only' });
  }
  next();
};

// ─────────────────────────────────────────────────────────────
// EMAIL TRANSPORTER
// ─────────────────────────────────────────────────────────────
async function getTransporter() {
  if (
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    !process.env.EMAIL_USER.includes('your_actual')
  ) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  const testAccount = await nodemailer.createTestAccount();

  console.log('\n📧 Ethereal test account created:');
  console.log('User:', testAccount.user);
  console.log('Pass:', testAccount.pass);

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

// ─────────────────────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    let { name, email, password } = req.body;

    name = name?.trim() || '';
    email = email?.trim().toLowerCase() || '';
    password = password?.trim() || '';

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter all fields',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      {
        id: savedUser._id,
        role: savedUser.role,
      },
      process.env.JWT_SECRET || 'secret123',
      {
        expiresIn: '1d',
      }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase() || '';
    password = password?.trim() || '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User not found',
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Invalid password',
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret123',
      {
        expiresIn: '1d',
      }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    let { email } = req.body;

    email = email?.trim().toLowerCase() || '';

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: 'No account found',
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;

    await user.save();

    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: '"AI Avatar" <noreply@aiavatar.app>',
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
      `,
    });

    const previewUrl =
      nodemailer.getTestMessageUrl(info);

    if (previewUrl) {
      console.log('Preview URL:', previewUrl);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// VERIFY OTP
// ─────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    let { email, otp } = req.body;

    email = email?.trim().toLowerCase() || '';
    otp = otp?.trim() || '';

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({
        error: 'Invalid OTP',
      });
    }

    if (new Date() > user.resetPasswordExpires) {
      return res.status(400).json({
        error: 'OTP expired',
      });
    }

    res.json({
      success: true,
      message: 'OTP verified',
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;

    email = email?.trim().toLowerCase() || '';
    otp = otp?.trim() || '';
    newPassword = newPassword?.trim() || '';

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({
        error: 'Invalid OTP',
      });
    }

    if (new Date() > user.resetPasswordExpires) {
      return res.status(400).json({
        error: 'OTP expired',
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      newPassword,
      salt
    );

    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// CURRENT USER
// ─────────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(
      req.user
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// SAVE VIDEO
// ─────────────────────────────────────────────────────────────
router.post(
  '/save-video',
  auth,
  async (req, res) => {
    try {
      const { name, url, prompt } = req.body;

      if (!url) {
        return res.status(400).json({
          error: 'Video URL is required',
        });
      }

      const user = await User.findById(req.user);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      // SAVE VIDEO
      user.videos.push({
        name: name || 'AI Video',
        url,
        prompt: prompt || '',
      });

      // INCREASE COUNT
      user.videosCreated += 1;

      await user.save();

      // SAVE ACTIVITY
      const activity = new Activity({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,

        action: 'video_generated',

        description:
          'User generated a new AI video',

        videoTitle: name || 'AI Video',

        videoUrl: url,

        prompt: prompt || '',

        status: 'success',
      });

      await activity.save();

      res.json({
        success: true,
        videos: user.videos,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// GET USER VIDEOS
// ─────────────────────────────────────────────────────────────
router.get(
  '/videos',
  auth,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user
      ).select('videos videosCreated');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      const videoList = user.videos || [];

      res.json({
        success: true,
        videos: videoList,
        count: videoList.length,
        videosCreated:
          user.videosCreated || 0,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// SUBMIT FEEDBACK
// ─────────────────────────────────────────────────────────────
router.post('/feedback', async (req, res) => {
  try {
    const {
      userId,
      userName,
      rating,
      message,
      comment,
    } = req.body;

    if (!rating) {
      return res.status(400).json({
        error: 'Rating required',
      });
    }

    const newFeedback = new Feedback({
      userId: userId || 'anonymous',
      userName: userName || 'Anonymous',
      rating,
      message: message || comment || '',
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      feedback: newFeedback,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// GET FEEDBACKS
// ─────────────────────────────────────────────────────────────
router.get('/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      feedbacks,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────
// CREATE ADMIN
// ─────────────────────────────────────────────────────────────
router.post(
  '/create-admin',
  async (req, res) => {
    try {
      const adminEmail =
        'admin2@gmail.com';

      const adminPassword =
        'Admin@1234';

      const existingAdmin =
        await User.findOne({
          email: adminEmail,
        });

      if (existingAdmin) {
        return res.status(400).json({
          error: 'Admin already exists',
        });
      }

      const salt = await bcrypt.genSalt(10);

      const hashedPassword =
        await bcrypt.hash(
          adminPassword,
          salt
        );

      const adminUser = new User({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });

      const savedAdmin =
        await adminUser.save();

      res.status(201).json({
        success: true,
        message:
          'Admin created successfully',
        user: {
          _id: savedAdmin._id,
          name: savedAdmin.name,
          email: savedAdmin.email,
          role: savedAdmin.role,
        },
      });
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// GET ALL VIDEOS (ADMIN ONLY)
// ─────────────────────────────────────────────────────────────
router.get(
  '/admin/all-videos',
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const users = await User.find({}).select('name email videos');

      let allVideos = [];

      users.forEach((u) => {
        if (u.videos && u.videos.length > 0) {
          u.videos.forEach((v) => {
            const videoObj = v.toObject ? v.toObject() : v;
            allVideos.push({
              ...videoObj,
              userName: u.name,
              userEmail: u.email,
            });
          });
        }
      });

      // Sort by newest first
      allVideos.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      res.json({
        success: true,
        videos: allVideos,
        count: allVideos.length,
      });
    } catch (err) {
      console.error('Error fetching all videos:', err);
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// GET ALL USERS WITH STATS (ADMIN ONLY)
// ─────────────────────────────────────────────────────────────
router.get(
  '/admin/all-users',
  auth,
  isAdmin,
  async (req, res) => {
    try {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });

      const usersWithStats = await Promise.all(
        users.map(async (u) => {
          const activityCount = await Activity.countDocuments({ userId: u._id.toString() });
          const videoCount = u.videos ? u.videos.length : 0;
          const promptCount = u.videos
            ? u.videos.filter(v => v.prompt && v.prompt.trim() !== '').length
            : 0;
          return {
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            plan: u.plan,
            videoCount,
            promptCount,
            activityCount,
            videosCreated: u.videosCreated || 0,
            createdAt: u.createdAt,
          };
        })
      );

      res.json({ success: true, users: usersWithStats, count: usersWithStats.length });
    } catch (err) {
      console.error('Error fetching all users:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

export default router;