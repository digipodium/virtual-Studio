const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getMe,
  logout,
} = require("../controller/authcontroller");




// ===============================
// 🔐 AUTH ROUTES
// ===============================

// 👉 Register User
router.post("/signup", signup);

// 👉 Login User
router.post("/login", login);


router.post("/forgotPassword", (req, res) => {
  res.json({ message: "Forgot password route working" });
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  // dummy check (test ke liye)
  if (otp === "123456") {
    return res.json({ message: "OTP verified" });
  }

  return res.status(400).json({ message: "Invalid OTP" });
});
module.exports = router;