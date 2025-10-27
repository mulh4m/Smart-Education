const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide course title"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide course description"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    subject: {
      type: String,
      required: [true, "Please provide subject"],
      trim: true,
      minlength: [2, "Subject must be at least 2 characters"],
      maxlength: [100, "Subject cannot exceed 100 characters"],
    },
    contentType: {
      type: String,
      required: [true, "Please provide content type"],
      enum: {
        values: ["video", "material", "homework"],
        message: "Content type must be either video, material, or homework",
      },
    },
    contentUrl: {
      type: String,
      required: [true, "Please provide content file"],
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Course must have a creator"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
courseSchema.index({ subject: 1, isActive: 1 });
courseSchema.index({ contentType: 1 });
courseSchema.index({ createdBy: 1 });

// Method to get course data for students (basic info)
courseSchema.methods.getStudentView = function () {
  return {
    _id: this._id,
    title: this.title,
    description: this.description,
    subject: this.subject,
    contentType: this.contentType,
    contentUrl: this.contentUrl,
    originalFileName: this.originalFileName,
    fileSize: this.fileSize,
    createdAt: this.createdAt,
  };
};

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;

