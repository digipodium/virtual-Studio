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

    // Profile (future use)
    avatar: {
      type: String,
      default: "",
    },

    // Role (security)
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // AI usage (project specific 🔥)
    videosCreated: {
      type: Number,
      default: 0,
    },

    // Subscription
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },

    // Account Status
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


// 🔐 DO NOT hash here - handled in routes to have better control
// UserSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 10);
// });


// Prevent model overwrite error (Next.js fix)
export default mongoose.model("User", UserSchema);