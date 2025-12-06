const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const uploadDirs = {
  videos: "./public/uploads/videos",
  materials: "./public/uploads/materials",
  homework: "./public/uploads/homework",
  activities: "./public/uploads/activities",
  submissions: "./public/uploads/submissions",
  general: "./public/uploads",
};

Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage with dynamic destination
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadDirs.general;

    // Check if this is a submission upload (check route path)
    const isSubmission = req.originalUrl && req.originalUrl.includes("/submit");
    
    if (isSubmission) {
      uploadPath = uploadDirs.submissions;
    } else {
      // For course content, we'll determine the correct directory in the controller
      // For now, just save to temp location - files will be moved by the controller
      // based on content section information
      
      // Try to infer from contentSections if available
      if (req.body.contentSections) {
        try {
          const sections = typeof req.body.contentSections === 'string'
            ? JSON.parse(req.body.contentSections)
            : req.body.contentSections;
          
          if (sections && sections.length > 0) {
            const firstContentType = sections[0].contentType;
            
            if (firstContentType === "video" || file.mimetype.startsWith("video/")) {
              uploadPath = uploadDirs.videos;
            } else if (firstContentType === "material") {
              uploadPath = uploadDirs.materials;
            } else if (firstContentType === "homework") {
              uploadPath = uploadDirs.homework;
            } else if (firstContentType === "activity") {
              uploadPath = uploadDirs.activities;
            }
          }
        } catch (e) {
          console.error("Error parsing contentSections in destination:", e);
        }
      } else if (
        req.body.contentType === "video" ||
        file.mimetype.startsWith("video/")
      ) {
        uploadPath = uploadDirs.videos;
      } else if (req.body.contentType === "material") {
        uploadPath = uploadDirs.materials;
      } else if (req.body.contentType === "homework") {
        uploadPath = uploadDirs.homework;
      } else if (req.body.contentType === "activity") {
        uploadPath = uploadDirs.activities;
      }
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|wmv|mkv|flv|webm|mp3|wav|ogg|m4a/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype =
    file.mimetype.startsWith("video/") || file.mimetype.startsWith("audio/");

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only video/audio files (mp4, avi, mov, wmv, mkv, flv, webm, mp3, wav, ogg, m4a) are allowed!"
      )
    );
  }
};

// File filter for materials and homework
const materialFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx|txt|zip|rar|xls|xlsx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extname) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only document files (pdf, doc, docx, ppt, pptx, txt, zip, rar, xls, xlsx) are allowed!"
      )
    );
  }
};

// File filter for course content (videos + materials)
const courseContentFilter = (req, file, cb) => {
  const videoTypes = /mp4|avi|mov|wmv|mkv|flv|webm|mp3|wav|ogg|m4a/;
  const materialTypes = /pdf|doc|docx|ppt|pptx|txt|zip|rar|xls|xlsx/;
  const extname = path.extname(file.originalname).toLowerCase();

  const isVideo = videoTypes.test(extname);
  const isMaterial = materialTypes.test(extname);

  if (isVideo || isMaterial) {
    cb(null, true);
  } else {
    cb(new Error("Only video/audio and document files are allowed!"));
  }
};

// Create multer upload instance for videos (100MB limit)
const uploadVideo = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: videoFilter,
});

// Create multer upload instance for materials (50MB limit)
const uploadMaterial = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: materialFilter,
});

// Create multer upload instance for course content (dynamic)
const uploadCourseContent = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: courseContentFilter,
});

// Middleware for course content upload (multiple files)
exports.uploadCourseContent = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = uploadCourseContent.array(fieldName, 50); // Allow up to 50 files

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            status: "error",
            message: "File size exceeds the limit (100MB)",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            status: "error",
            message: "Too many files. Maximum 50 files allowed.",
          });
        }
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      }
      next();
    });
  };
};

// Middleware for video upload
exports.uploadVideo = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = uploadVideo.single(fieldName);

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            status: "error",
            message: "Video size exceeds the limit (100MB)",
          });
        }
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      }
      next();
    });
  };
};

// Middleware for material upload
exports.uploadMaterial = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = uploadMaterial.single(fieldName);

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            status: "error",
            message: "File size exceeds the limit (50MB)",
          });
        }
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      }
      next();
    });
  };
};

// Utility function to delete file
exports.deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};
