const User = require("../models/User");

/**
 * @desc    Create a new teacher
 * @route   POST /api/admin/teachers
 * @access  Private/Admin only
 */
exports.createTeacher = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required fields",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User with this email already exists",
      });
    }

    // Create teacher
    const teacher = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone,
      role: "teacher",
      isVerified: true,
    });

    res.status(201).json({
      status: "success",
      message: "Teacher created successfully",
      data: {
        teacher: {
          _id: teacher._id,
          fullName: teacher.fullName,
          email: teacher.email,
          phone: teacher.phone,
          role: teacher.role,
          createdAt: teacher.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Create teacher error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error creating teacher",
    });
  }
};

/**
 * @desc    Get all teachers
 * @route   GET /api/admin/teachers
 * @access  Private/Admin only
 */
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );

    res.status(200).json({
      status: "success",
      results: teachers.length,
      data: {
        teachers,
      },
    });
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error fetching teachers",
    });
  }
};

/**
 * @desc    Get all students
 * @route   GET /api/admin/students
 * @access  Private/Admin only
 */
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );

    res.status(200).json({
      status: "success",
      results: students.length,
      data: {
        students,
      },
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error fetching students",
    });
  }
};

/**
 * @desc    Get all users (admin dashboard)
 * @route   GET /api/admin/users
 * @access  Private/Admin only
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error fetching users",
    });
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin only
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        status: "error",
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error deleting user",
    });
  }
};

/**
 * @desc    Update user role
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private/Admin only
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!["admin", "teacher", "student"].includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role. Must be admin, teacher, or student",
      });
    }

    // Prevent admin from changing their own role
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        status: "error",
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "User role updated successfully",
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error updating user role",
    });
  }
};

