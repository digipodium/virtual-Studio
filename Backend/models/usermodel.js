import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Profile
    avatar: {
      type: String,
      default: '',
    },

    // Role
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // AI Usage
    videosCreated: {
      type: Number,
      default: 0,
    },

    // Saved Videos
    videos: [
      {
        name: {
          type: String,
          default: 'AI Video',
        },

        url: {
          type: String,
          required: true,
        },

        prompt: {
          type: String,
          default: '',
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Subscription
    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },

    // Account Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Password Reset OTP
    resetPasswordOtp: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 🔐 Password hashing handled in routes
// UserSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 10);
// });

// Prevent model overwrite error
export default mongoose.models.User ||
  mongoose.model('User', UserSchema);