const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { uploadCourseContent } = require("../middleware/upload");
const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getCoursesBySubject,
  getSubjects,
  getCourseStats,
  submitHomework,
  getMySubmission,
  getSubmissions,
  gradeSubmission,
  updateSubmission,
  deleteSubmission,
  downloadCourseFile,
  downloadSubmissionFile,
  viewCourseFile,
} = require("../controllers/courseController");

// Protect all routes
router.use(protect);

// Public routes (all authenticated users)
router.get("/", getCourses);
router.get("/subjects/list", getSubjects);
router.get("/subject/:subject", getCoursesBySubject);
router.get("/stats/overview", authorize("admin", "teacher"), getCourseStats);
router.get("/download/:courseId/:sectionIndex/:fileIndex", downloadCourseFile);
router.get("/view/:courseId/:sectionIndex/:fileIndex", viewCourseFile);
router.get(
  "/download-submission/:submissionId/:fileIndex",
  downloadSubmissionFile
);

// Submission routes (more specific, must come before /:id)
// Student routes
router.post(
  "/:courseId/submit",
  authorize("student"),
  uploadCourseContent("content"),
  submitHomework
);

router.get("/:courseId/my-submission", authorize("student"), getMySubmission);

router.put(
  "/:courseId/submissions/:submissionId",
  authorize("student"),
  uploadCourseContent("content"),
  updateSubmission
);

router.delete(
  "/:courseId/submissions/:submissionId",
  authorize("student"),
  deleteSubmission
);

// teacher/Admin routes
router.get(
  "/:courseId/submissions",
  authorize("admin", "teacher"),
  getSubmissions
);

router.put(
  "/:courseId/submissions/:submissionId/grade",
  authorize("admin", "teacher"),
  gradeSubmission
);

// Admin & teacher only routes (specific routes before generic)
router.post(
  "/",
  authorize("admin", "teacher"),
  uploadCourseContent("content"),
  createCourse
);

router.put(
  "/:id",
  authorize("admin", "teacher"),
  uploadCourseContent("content"),
  updateCourse
);

router.delete("/:id", authorize("admin", "teacher"), deleteCourse);

// Generic single course route (must be last)
router.get("/:id", getCourse);

module.exports = router;
