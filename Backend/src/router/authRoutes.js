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




module.exports = router;