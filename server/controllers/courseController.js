const Course = require("../models/Course");
const Submission = require("../models/Submission");
const { deleteFile } = require("../middleware/upload");
const path = require("path");
const fs = require("fs");

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private/Admin & Teacher
 */
exports.createCourse = async (req, res) => {
  try {
    const { title, description, subject, contentSections } = req.body;

    // Validate required fields
    if (!title || !description || !subject) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required fields",
      });
    }

    // Parse contentSections if it's a string (from FormData)
    let parsedContentSections;
    try {
      parsedContentSections = typeof contentSections === 'string' 
        ? JSON.parse(contentSections) 
        : contentSections;
    } catch (error) {
      return res.status(400).json({
        status: "error",
        message: "Invalid content sections format",
      });
    }

    // Validate content sections
    if (!parsedContentSections || !Array.isArray(parsedContentSections) || parsedContentSections.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Please provide at least one content section",
      });
    }

    // Validate each content section
    for (const section of parsedContentSections) {
      if (!section.contentType || !section.title) {
        return res.status(400).json({
          status: "error",
          message: "Each content section must have a content type and title",
        });
      }
      
      if (!["video", "material", "homework", "activity"].includes(section.contentType)) {
        return res.status(400).json({
          status: "error",
          message: "Content type must be video, material, homework, or activity",
        });
      }
    }

    // Check for duplicate title (case-insensitive)
    const existingCourse = await Course.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
    });
    if (existingCourse) {
      return res.status(409).json({
        status: "error",
        message: "A course with this title already exists. Please choose a different title.",
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Please upload at least one file",
      });
    }

    // Process files and assign them to sections
    let fileIndex = 0;
    const processedSections = parsedContentSections.map((section) => {
      const sectionFiles = [];
      const fileCount = section.fileCount || 1;
      
      for (let i = 0; i < fileCount && fileIndex < req.files.length; i++) {
        const file = req.files[fileIndex];
        sectionFiles.push({
          url: `/uploads/${section.contentType}s/${file.filename}`,
          originalFileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        });
        fileIndex++;
      }

      return {
        contentType: section.contentType,
        title: section.title,
        description: section.description || "",
        files: sectionFiles,
      };
    });

    // Create course
    const course = await Course.create({
      title,
      description,
      subject,
      contentSections: processedSections,
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
    // Delete uploaded files if course creation fails
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.path) {
          deleteFile(file.path);
        }
      });
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
      query["contentSections.contentType"] = contentType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { "contentSections.title": { $regex: search, $options: "i" } },
        { "contentSections.description": { $regex: search, $options: "i" } },
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
    const { title, description, subject, contentSections } = req.body;

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

    // Update basic fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (subject) course.subject = subject;

    // Handle content sections update
    if (contentSections) {
      let parsedContentSections;
      try {
        parsedContentSections = typeof contentSections === 'string' 
          ? JSON.parse(contentSections) 
          : contentSections;
      } catch (error) {
        return res.status(400).json({
          status: "error",
          message: "Invalid content sections format",
        });
      }

      // If new files are uploaded, process them
      if (req.files && req.files.length > 0) {
        let fileIndex = 0;
        const updatedSections = parsedContentSections.map((section) => {
          const existingSection = course.contentSections.find(
            s => s._id && s._id.toString() === section._id
          );

          if (section.hasNewFiles && fileIndex < req.files.length) {
            // Add new files to this section
            const newFiles = [];
            const fileCount = section.newFileCount || 1;
            
            for (let i = 0; i < fileCount && fileIndex < req.files.length; i++) {
              const file = req.files[fileIndex];
              newFiles.push({
                url: `/uploads/${section.contentType}s/${file.filename}`,
                originalFileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
              });
              fileIndex++;
            }

            return {
              ...section,
              files: [...(existingSection?.files || []), ...newFiles],
            };
          }

          return {
            ...section,
            files: existingSection?.files || [],
          };
        });

        course.contentSections = updatedSections;
      } else {
        // No new files, just update section metadata
        course.contentSections = parsedContentSections.map((section) => {
          const existingSection = course.contentSections.find(
            s => s._id && s._id.toString() === section._id
          );
          
          return {
            ...section,
            files: existingSection?.files || [],
          };
        });
      }
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
    // Delete uploaded files if update fails
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.path) {
          deleteFile(file.path);
        }
      });
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

    // Delete all files from storage
    if (course.contentSections && course.contentSections.length > 0) {
      course.contentSections.forEach((section) => {
        if (section.files && section.files.length > 0) {
          section.files.forEach((file) => {
            const filePath = path.join(__dirname, "..", "public", file.url);
            deleteFile(filePath);
          });
        }
      });
    }

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
    
    // Count courses by content type (courses can have multiple content types)
    const videoCount = await Course.countDocuments({
      "contentSections.contentType": "video",
      isActive: true,
    });
    const materialCount = await Course.countDocuments({
      "contentSections.contentType": "material",
      isActive: true,
    });
    const homeworkCount = await Course.countDocuments({
      "contentSections.contentType": "homework",
      isActive: true,
    });
    const activityCount = await Course.countDocuments({
      "contentSections.contentType": "activity",
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
            activity: activityCount,
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

/**
 * @desc    Submit homework/activity (Student submits their work)
 * @route   POST /api/courses/:courseId/submit
 * @access  Private/Student
 */
exports.submitHomework = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({
        status: "error",
        message: "Only students can submit homework/activity",
      });
    }

    // Find the course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    // Check if course has homework or activity sections
    const hasSubmittableContent = course.contentSections.some(section => 
      ["homework", "activity"].includes(section.contentType)
    );
    
    if (!hasSubmittableContent) {
      return res.status(400).json({
        status: "error",
        message: "This course does not have homework or activity sections",
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Please upload at least one file",
      });
    }

    // Process uploaded files
    const submittedFiles = req.files.map((file) => ({
      url: `/uploads/submissions/${file.filename}`,
      originalFileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    }));

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({
      course: courseId,
      student: req.user._id,
    });

    if (existingSubmission) {
      // Delete old files
      if (existingSubmission.submittedFiles && existingSubmission.submittedFiles.length > 0) {
        existingSubmission.submittedFiles.forEach((file) => {
          const filePath = path.join(__dirname, "..", "public", file.url);
          deleteFile(filePath);
        });
      }

      // Update existing submission
      existingSubmission.submittedFiles = submittedFiles;
      existingSubmission.status = "submitted";
      existingSubmission.submittedAt = new Date();
      // Clear grade and feedback if resubmitting
      existingSubmission.grade = undefined;
      existingSubmission.feedback = undefined;
      existingSubmission.gradedBy = undefined;
      existingSubmission.gradedAt = undefined;

      await existingSubmission.save();
      await existingSubmission.populate("student", "fullName email");
      await existingSubmission.populate("course", "title contentType");

      return res.status(200).json({
        status: "success",
        message: "Submission updated successfully",
        data: {
          submission: existingSubmission,
        },
      });
    }

    // Create new submission
    const submission = await Submission.create({
      course: courseId,
      student: req.user._id,
      submittedFiles,
      status: "submitted",
    });

    await submission.populate("student", "fullName email");
    await submission.populate("course", "title contentType");

    res.status(201).json({
      status: "success",
      message: "Submission created successfully",
      data: {
        submission,
      },
    });
  } catch (error) {
    // Delete uploaded files if submission fails
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.path) {
          deleteFile(file.path);
        }
      });
    }

    console.error("Submit homework error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error submitting homework",
    });
  }
};

/**
 * @desc    Get my submission for a course (Student views their own submission)
 * @route   GET /api/courses/:courseId/my-submission
 * @access  Private/Student
 */
exports.getMySubmission = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({
        status: "error",
        message: "Only students can view their own submissions",
      });
    }

    const submission = await Submission.findOne({
      course: courseId,
      student: req.user._id,
    })
      .populate("course", "title contentType subject")
      .populate("gradedBy", "fullName email");

    if (!submission) {
      return res.status(404).json({
        status: "error",
        message: "Submission not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        submission,
      },
    });
  } catch (error) {
    console.error("Get my submission error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error fetching submission",
    });
  }
};

/**
 * @desc    Get all submissions for a course (Teachers/Admins view all submissions)
 * @route   GET /api/courses/:courseId/submissions
 * @access  Private/Admin & Teacher
 */
exports.getSubmissions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.query;

    // Check if user is admin or teacher
    if (!["admin", "teacher"].includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Only teachers and admins can view submissions",
      });
    }

    // Find the course and populate createdBy
    const course = await Course.findById(courseId).populate('createdBy', 'fullName email role');

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    // Debug logging
    console.log("Course found:", {
      courseId: course._id,
      courseTitle: course.title,
      createdBy: course.createdBy,
      requestingUser: {
        id: req.user._id,
        role: req.user.role,
        name: req.user.fullName
      }
    });

    // Check if user is admin or the course creator
    const isAdmin = req.user.role === "admin";
    const isTeacher = req.user.role === "teacher";
    const isCourseCreator = course.createdBy && course.createdBy._id.toString() === req.user._id.toString();
    
    // For now, allow all teachers to view submissions (you can make this more restrictive later)
    // Admins can always view, course creators can always view, and teachers can view all submissions
    if (!isAdmin && !isCourseCreator && !isTeacher) {
      console.log("Authorization failed:", {
        isAdmin,
        isTeacher,
        isCourseCreator,
        courseCreatedById: course.createdBy?._id?.toString(),
        requestingUserId: req.user._id.toString()
      });
      
      return res.status(403).json({
        status: "error",
        message: "Not authorized to view submissions for this course",
      });
    }

    console.log("Authorization successful:", { isAdmin, isTeacher, isCourseCreator });

    // Build query
    let query = { course: courseId };
    if (status) {
      query.status = status;
    }

    const submissions = await Submission.find(query)
      .populate("student", "fullName email")
      .populate("gradedBy", "fullName email")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      status: "success",
      results: submissions.length,
      data: {
        submissions,
      },
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error fetching submissions",
    });
  }
};

/**
 * @desc    Grade a submission (Teachers/Admins grade student submissions)
 * @route   PUT /api/courses/:courseId/submissions/:submissionId/grade
 * @access  Private/Admin & Teacher
 */
exports.gradeSubmission = async (req, res) => {
  try {
    const { courseId, submissionId } = req.params;
    const { grade, feedback } = req.body;

    // Check if user is admin or teacher
    if (!["admin", "teacher"].includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Only teachers and admins can grade submissions",
      });
    }

    // Find the course and populate createdBy
    const course = await Course.findById(courseId).populate('createdBy', 'fullName email role');

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    // Check if user is admin or the course creator
    const isAdmin = req.user.role === "admin";
    const isTeacher = req.user.role === "teacher";
    const isCourseCreator = course.createdBy && course.createdBy._id.toString() === req.user._id.toString();
    
    // Allow all teachers to grade submissions (you can make this more restrictive later)
    if (!isAdmin && !isCourseCreator && !isTeacher) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to grade submissions for this course",
      });
    }

    // Find the submission
    const submission = await Submission.findOne({
      _id: submissionId,
      course: courseId,
    });

    if (!submission) {
      return res.status(404).json({
        status: "error",
        message: "Submission not found",
      });
    }

    // Validate grade
    if (grade !== undefined) {
      if (isNaN(grade) || grade < 0 || grade > 100) {
        return res.status(400).json({
          status: "error",
          message: "Grade must be a number between 0 and 100",
        });
      }
      submission.grade = grade;
    }

    // Update feedback
    if (feedback !== undefined) {
      submission.feedback = feedback;
    }

    // Update status and grading info
    submission.status = "graded";
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();

    await submission.save();
    await submission.populate("student", "fullName email");
    await submission.populate("gradedBy", "fullName email");
    await submission.populate("course", "title contentType");

    res.status(200).json({
      status: "success",
      message: "Submission graded successfully",
      data: {
        submission,
      },
    });
  } catch (error) {
    console.error("Grade submission error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error grading submission",
    });
  }
};

/**
 * @desc    Update submission (Student updates their submission if not graded)
 * @route   PUT /api/courses/:courseId/submissions/:submissionId
 * @access  Private/Student
 */
exports.updateSubmission = async (req, res) => {
  try {
    const { courseId, submissionId } = req.params;

    // Check if user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({
        status: "error",
        message: "Only students can update their submissions",
      });
    }

    // Find the submission
    const submission = await Submission.findOne({
      _id: submissionId,
      course: courseId,
      student: req.user._id,
    });

    if (!submission) {
      return res.status(404).json({
        status: "error",
        message: "Submission not found",
      });
    }

    // Check if submission is already graded
    if (submission.status === "graded") {
      return res.status(400).json({
        status: "error",
        message: "Cannot update a graded submission",
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Please upload at least one file",
      });
    }

    // Delete old files
    if (submission.submittedFiles && submission.submittedFiles.length > 0) {
      submission.submittedFiles.forEach((file) => {
        const filePath = path.join(__dirname, "..", "public", file.url);
        deleteFile(filePath);
      });
    }

    // Process new uploaded files
    const submittedFiles = req.files.map((file) => ({
      url: `/uploads/submissions/${file.filename}`,
      originalFileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    }));

    // Update submission
    submission.submittedFiles = submittedFiles;
    submission.submittedAt = new Date();

    await submission.save();
    await submission.populate("student", "fullName email");
    await submission.populate("course", "title contentType");

    res.status(200).json({
      status: "success",
      message: "Submission updated successfully",
      data: {
        submission,
      },
    });
  } catch (error) {
    // Delete uploaded files if update fails
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.path) {
          deleteFile(file.path);
        }
      });
    }

    console.error("Update submission error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error updating submission",
    });
  }
};

/**
 * @desc    Delete submission (Student deletes their submission if not graded)
 * @route   DELETE /api/courses/:courseId/submissions/:submissionId
 * @access  Private/Student
 */
exports.deleteSubmission = async (req, res) => {
  try {
    const { courseId, submissionId } = req.params;

    // Check if user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({
        status: "error",
        message: "Only students can delete their submissions",
      });
    }

    // Find the submission
    const submission = await Submission.findOne({
      _id: submissionId,
      course: courseId,
      student: req.user._id,
    });

    if (!submission) {
      return res.status(404).json({
        status: "error",
        message: "Submission not found",
      });
    }

    // Check if submission is already graded
    if (submission.status === "graded") {
      return res.status(400).json({
        status: "error",
        message: "Cannot delete a graded submission",
      });
    }

    // Delete files from storage
    if (submission.submittedFiles && submission.submittedFiles.length > 0) {
      submission.submittedFiles.forEach((file) => {
        const filePath = path.join(__dirname, "..", "public", file.url);
        deleteFile(filePath);
      });
    }

    // Delete submission from database
    await Submission.findByIdAndDelete(submissionId);

    res.status(200).json({
      status: "success",
      message: "Submission deleted successfully",
    });
  } catch (error) {
    console.error("Delete submission error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error deleting submission",
    });
  }
};

/**
 * @desc    Download course file
 * @route   GET /api/courses/download/:courseId/:fileIndex
 * @access  Private (All authenticated users)
 */
exports.downloadCourseFile = async (req, res) => {
  try {
    const { courseId, sectionIndex, fileIndex } = req.params;

    // Find the course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    // Validate section index
    const secIndex = parseInt(sectionIndex);
    if (isNaN(secIndex) || secIndex < 0 || secIndex >= course.contentSections.length) {
      return res.status(400).json({
        status: "error",
        message: "Invalid section index",
      });
    }

    const section = course.contentSections[secIndex];

    // Validate file index
    const fIndex = parseInt(fileIndex);
    if (isNaN(fIndex) || fIndex < 0 || fIndex >= section.files.length) {
      return res.status(400).json({
        status: "error",
        message: "Invalid file index",
      });
    }

    const file = section.files[fIndex];
    const filePath = path.join(__dirname, "..", "public", file.url);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: "error",
        message: "File not found on server",
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);

    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalFileName}"`);
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error("Download file error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error downloading file",
    });
  }
};

/**
 * @desc    Download submission file
 * @route   GET /api/courses/download-submission/:submissionId/:fileIndex
 * @access  Private (Students can download their own, Teachers/Admins can download any)
 */
exports.downloadSubmissionFile = async (req, res) => {
  try {
    const { submissionId, fileIndex } = req.params;

    // Find the submission
    const submission = await Submission.findById(submissionId).populate('course');

    if (!submission) {
      return res.status(404).json({
        status: "error",
        message: "Submission not found",
      });
    }

    // Check permissions
    const isStudent = req.user.role === "student";
    const isAdmin = req.user.role === "admin";
    const isTeacher = req.user.role === "teacher";
    const isOwnSubmission = submission.student.toString() === req.user._id.toString();
    const isAuthorizedTeacher = isTeacher && submission.course && submission.course.createdBy && submission.course.createdBy.toString() === req.user._id.toString();

    if (!isOwnSubmission && !isAdmin && !isAuthorizedTeacher) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to download this submission file",
      });
    }

    // Validate file index
    const index = parseInt(fileIndex);
    if (isNaN(index) || index < 0 || index >= submission.submittedFiles.length) {
      return res.status(400).json({
        status: "error",
        message: "Invalid file index",
      });
    }

    const file = submission.submittedFiles[index];
    const filePath = path.join(__dirname, "..", "public", file.url);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: "error",
        message: "File not found on server",
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);

    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalFileName}"`);
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error("Download submission file error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error downloading submission file",
    });
  }
};
