const User = require("../models/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/sendEmail");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret_key", {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User with this email already exists",
      });
    }

    // Create user (no verification token needed)
    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role: role || 'student', // Default to student if not provided
      isVerified: true, // Set as verified immediately
    });

    try {
      // Send welcome email using EJS template
      const loginUrl = `${req.protocol}://${req.get('host')}/login`;
      await sendMail({
        email: email,
        subject: "Welcome to Smart App!",
        template: "welcome",
        data: {
          fullName,
          role: user.role,
          loginUrl,
        },
      });

      res.status(201).json({
        status: "success",
        message: "Registration successful! Welcome to Smart App!",
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
          },
        },
      });
    } catch (emailError) {
      console.error("Welcome email sending failed:", emailError);

      // Still return success but notify that email failed
      res.status(201).json({
        status: "success",
        message: "Registration successful! However, welcome email could not be sent.",
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
          },
        },
      });
    }
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Registration failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide email and password",
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Check if password matches
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        status: "error",
        message: "Please verify your email before logging in",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from user object
    const userWithoutPassword = user.toJSON();

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Login failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        status: "success",
        message: "If an account exists with this email, you will receive password reset instructions.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    try {
      // Send password reset email using EJS template
      await sendMail({
        email: user.email,
        subject: "Password Reset Request - Smart App",
        template: "forgotPassword",
        data: {
          fullName: user.fullName,
          resetUrl,
        },
      });

      res.status(200).json({
        status: "success",
        message: "If an account exists with this email, you will receive password reset instructions.",
      });
    } catch (emailError) {
      console.error("Password reset email failed:", emailError);
      
      // Clear the reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(500).json({
        status: "error",
        message: "Failed to send password reset email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      status: "error",
      message: "Password reset request failed. Please try again.",
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve user data",
    });
  }
};

/**
 * @desc    Get all users (for testing)
 * @route   GET /api/auth/users
 * @access  Public (change to private in production)
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      status: "success",
      count: users.length,
      data: { users },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve users",
    });
  }
};
