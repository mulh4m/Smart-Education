const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  getMe,
  getUsers,
  updateProfile,
  changePassword,
} = require("../controllers/authController");
const {
  validateRegistration,
  validateLogin,
} = require("../middleware/validation");
const { protect } = require("../middleware/auth");

// Registration route
router.post("/register", validateRegistration, register);

// Login route
router.post("/login", validateLogin, login);

// Forgot password route
router.post("/forgot-password", forgotPassword);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Get all users (for testing - remove or protect in production)
router.get("/users", getUsers);

module.exports = router;
