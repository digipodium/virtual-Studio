require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./router/authRoutes");
// ✅ fixed
const connectDB = require("./connection");

const app = express();
const port = 5000;

// 🔌 Connect DB
connectDB();

// 🧩 Middleware
app.use(cors());
app.use(express.json());

// 🔗 Routes
app.use("/api/auth", authRoutes);
 // ✅ important

// 🌐 Root endpoints
app.get("/", (req, res) => {
  res.send("response from express");
});

app.get("/add", (req, res) => {
  res.send("response from add");
});

app.get("/getall", (req, res) => {
  res.send("response from getall");
});

app.get("/getById", (req, res) => {
  res.send("response from getbyid");
});

app.get("/getbyemail", (req, res) => {
  res.send("response from getbyemail");
});

app.get("/delete", (req, res) => {
  res.send("response from delete");
});

app.get("/update", (req, res) => {
  res.send("response from update");
});

// 🚀 Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});