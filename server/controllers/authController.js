const User = require("../models/User");
const crypto = require("crypto"); // hash the password
const jwt = require("jsonwebtoken"); // web
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
      role: role || "student", // Default to student if not provided
      isVerified: true, // Set as verified immediately
    });

    try {
      // Send welcome email using EJS template
      const loginUrl = `${req.protocol}://${req.get("host")}/login`;
      await sendMail({
        email: email,
        subject: "Welcome to Smart Education!",
        template: "welcome",
        data: {
          fullName,
          role: user.role,
          loginUrl,
        },
      });

      res.status(201).json({
        status: "success",
        message: "Registration successful! Welcome to Smart Education!",
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
        message:
          "Registration successful! However, welcome email could not be sent.",
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

    // Fetch user including hashed password so we can revert on email failure if needed
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      // Return explicit error when email does not exist
      return res.status(404).json({
        status: "error",
        message: "No account found with the provided email address.",
      });
    }

    // Helper to generate an alphanumeric temporary password
    const generateTempPassword = (length = 12) => {
      return crypto
        .randomBytes(Math.ceil((length * 3) / 4))
        .toString("base64")
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, length);
    };

    const newPasswordPlain = generateTempPassword(12);
    const previousHashedPassword = user.password;

    // Clear any existing reset token/expiry and set the new password (pre 'save' will hash)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.password = newPasswordPlain;

    await user.save();

    try {
      // Send email containing the new temporary password
      await sendMail({
        email: user.email,
        subject: "Your New Temporary Password - Smart Education",
        template: "forgotPassword",
        data: {
          fullName: user.fullName,
          newPassword: newPasswordPlain,
          loginUrl: `${req.protocol}://${req.get("host")}/login`,
        },
      });

      return res.status(200).json({
        status: "success",
        message:
          "An email with the new temporary password has been sent if the account exists.",
      });
    } catch (emailError) {
      console.error("Password reset email failed:", emailError);

      // Attempt to restore previous hashed password (use direct update to avoid re-hashing)
      try {
        await User.updateOne(
          { _id: user._id },
          { $set: { password: previousHashedPassword } }
        );
      } catch (restoreError) {
        console.error(
          "Failed to restore previous password after email failure:",
          restoreError
        );
      }

      return res.status(500).json({
        status: "error",
        message: "Failed to send new password email. Please try again.",
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
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const userId = req.user.id;

    // Prevent email updates
    if (email && email !== req.user.email) {
      return res.status(400).json({
        status: "error",
        message: "Email cannot be changed",
      });
    }

    // Update user profile (excluding email)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

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
      message: "Failed to update profile. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "error",
        message: "Please provide current password, new password, and confirm password",
      });
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        message: "New password and confirm password do not match",
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "New password must be at least 6 characters long",
      });
    }

    // Get user with password
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if current password is correct
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        status: "error",
        message: "New password must be different from current password",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to change password. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
