const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createTeacher,
  getTeachers,
  getStudents,
  getAllUsers,
  deleteUser,
  updateUserRole,
} = require("../controllers/adminController");

// Protect all routes - admin only
router.use(protect);
router.use(authorize("admin"));

// Teacher management routes
router.post("/teachers", createTeacher);
router.get("/teachers", getTeachers);

// Student management routes
router.get("/students", getStudents);

// User management routes
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/role", updateUserRole);  //update

module.exports = router;

