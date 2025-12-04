const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Submission must belong to a course"],
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Submission must have a student"],
    },
    submittedFiles: [
      {
        url: {
          type: String,
          required: true,
        },
        originalFileName: {
          type: String,
          required: true,
        },
        fileSize: {
          type: Number,
          required: true,
        },
        mimeType: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["submitted", "graded", "returned"],
        message: "Status must be submitted, graded, or returned",
      },
      default: "submitted",
    },
    grade: {
      type: Number,
      min: [0, "Grade cannot be negative"],
      max: [100, "Grade cannot exceed 100"],
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, "Feedback cannot exceed 2000 characters"],
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    gradedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
submissionSchema.index({ course: 1, student: 1 });
submissionSchema.index({ student: 1 });
submissionSchema.index({ course: 1, status: 1 });

// Prevent duplicate submissions from same student for same course
submissionSchema.index({ course: 1, student: 1 }, { unique: true });

// Method to get submission data for students
submissionSchema.methods.getStudentView = function () {
  return {
    _id: this._id,
    course: this.course,
    submittedFiles: this.submittedFiles,
    status: this.status,
    grade: this.grade,
    feedback: this.feedback,
    submittedAt: this.submittedAt,
    updatedAt: this.updatedAt,
  };
};

// Method to get submission data for teachers/admins
submissionSchema.methods.getTeacherView = function () {
  return {
    _id: this._id,
    course: this.course,
    student: this.student,
    submittedFiles: this.submittedFiles,
    status: this.status,
    grade: this.grade,
    feedback: this.feedback,
    gradedBy: this.gradedBy,
    gradedAt: this.gradedAt,
    submittedAt: this.submittedAt,
    updatedAt: this.updatedAt,
  };
};

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;
