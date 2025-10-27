const Course = require("../models/Course");
const { deleteFile } = require("../middleware/upload");
const path = require("path");

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private/Admin & Teacher
 */
exports.createCourse = async (req, res) => {
  try {
    const { title, description, subject, contentType } = req.body;

    // Validate required fields
    if (!title || !description || !subject || !contentType) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required fields",
      });
    }

    // Validate content type
    if (!["video", "material", "homework"].includes(contentType)) {
      return res.status(400).json({
        status: "error",
        message: "Content type must be video, material, or homework",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please upload a file",
      });
    }

    // Construct the file URL
    const contentUrl = `/uploads/${contentType}s/${req.file.filename}`;

    // Create course
    const course = await Course.create({
      title,
      description,
      subject,
      contentType,
      contentUrl,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      createdBy: req.user._id,
    });

    // Populate creator info
    await course.populate("createdBy", "fullName email role");

    res.status(201).json({
      status: "success",
      message: "Course created successfully",
      data: {
        course,
      },
    });
  } catch (error) {
    // Delete uploaded file if course creation fails
    if (req.file) {
      deleteFile(req.file.path);
    }

    console.error("Create course error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error creating course",
    });
  }
};

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Private (All authenticated users)
 */
exports.getCourses = async (req, res) => {
  try {
    const { subject, contentType, search } = req.query;

    // Build query
    let query = { isActive: true };

    if (subject) {
      query.subject = subject;
    }

    if (contentType) {
      query.contentType = contentType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const courses = await Course.find(query)
      .populate("createdBy", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: courses.length,
      data: {
        courses,
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error fetching courses",
    });
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Private (All authenticated users)
 */
exports.getCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).populate(
      "createdBy",
      "fullName email role"
    );

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error fetching course",
    });
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private/Admin & Teacher
 */
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, contentType } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    // Check if user is admin or the course creator
    if (
      req.user.role !== "admin" &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to update this course",
      });
    }

    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (subject) course.subject = subject;

    // If new file is uploaded, delete old file and update
    if (req.file) {
      // Delete old file
      const oldFilePath = path.join(__dirname, "..", "public", course.contentUrl);
      deleteFile(oldFilePath);

      // Update with new file
      course.contentUrl = `/uploads/${contentType || course.contentType}s/${req.file.filename}`;
      course.originalFileName = req.file.originalname;
      course.fileSize = req.file.size;
      course.mimeType = req.file.mimetype;
    }

    if (contentType) {
      course.contentType = contentType;
    }

    await course.save();
    await course.populate("createdBy", "fullName email role");

    res.status(200).json({
      status: "success",
      message: "Course updated successfully",
      data: {
        course,
      },
    });
  } catch (error) {
    // Delete uploaded file if update fails
    if (req.file) {
      deleteFile(req.file.path);
    }

    console.error("Update course error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error updating course",
    });
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private/Admin & Teacher
 */
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    // Check if user is admin or the course creator
    if (
      req.user.role !== "admin" &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to delete this course",
      });
    }

    // Delete the file from storage
    const filePath = path.join(__dirname, "..", "public", course.contentUrl);
    deleteFile(filePath);

    // Delete the course from database
    await Course.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error deleting course",
    });
  }
};

/**
 * @desc    Get courses by subject
 * @route   GET /api/courses/subject/:subject
 * @access  Private (All authenticated users)
 */
exports.getCoursesBySubject = async (req, res) => {
  try {
    const { subject } = req.params;

    const courses = await Course.find({ subject, isActive: true })
      .populate("createdBy", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: courses.length,
      data: {
        courses,
      },
    });
  } catch (error) {
    console.error("Get courses by subject error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error fetching courses",
    });
  }
};

/**
 * @desc    Get all unique subjects
 * @route   GET /api/courses/subjects/list
 * @access  Private (All authenticated users)
 */
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Course.distinct("subject", { isActive: true });

    res.status(200).json({
      status: "success",
      results: subjects.length,
      data: {
        subjects: subjects.sort(),
      },
    });
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error fetching subjects",
    });
  }
};

/**
 * @desc    Get courses statistics (for admin/teacher dashboard)
 * @route   GET /api/courses/stats
 * @access  Private/Admin & Teacher
 */
exports.getCourseStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments({ isActive: true });
    const videoCount = await Course.countDocuments({
      contentType: "video",
      isActive: true,
    });
    const materialCount = await Course.countDocuments({
      contentType: "material",
      isActive: true,
    });
    const homeworkCount = await Course.countDocuments({
      contentType: "homework",
      isActive: true,
    });

    const subjects = await Course.distinct("subject", { isActive: true });

    res.status(200).json({
      status: "success",
      data: {
        stats: {
          totalCourses,
          byContentType: {
            video: videoCount,
            material: materialCount,
            homework: homeworkCount,
          },
          totalSubjects: subjects.length,
        },
      },
    });
  } catch (error) {
    console.error("Get course stats error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error fetching course statistics",
    });
  }
};

