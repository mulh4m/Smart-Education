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
router.get("/download/:courseId/:sectionIndex/:fileIndex", downloadCourseFile);
router.get("/view/:courseId/:sectionIndex/:fileIndex", viewCourseFile);
router.get(
  "/download-submission/:submissionId/:fileIndex",
  downloadSubmissionFile
);
router.get("/:id", getCourse);

// Admin & teacher only routes
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

router.get("/stats/overview", authorize("admin", "teacher"), getCourseStats);

// Submission routes
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

module.exports = router;
