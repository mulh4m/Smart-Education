import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  getCourse,
  getMySubmission,
  getSubmissions,
  gradeSubmission,
  selectCurrentCourse,
  selectMySubmission,
  selectSubmissions,
  selectCoursesLoading,
  selectCoursesError,
  selectCoursesSuccess,
  clearError,
  clearSuccessMessage,
} from "../store/slices/courseSlice";
import { selectToken, selectUserRole } from "../store/slices/authSlice";
import SubmitHomework from "../features/shared/SubmitHomework";

const CourseView = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const course = useSelector(selectCurrentCourse);
  const token = useSelector(selectToken);
  const userRole = useSelector(selectUserRole);
  const isLoading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);

  const [isPlaying, setIsPlaying] = useState(false);
  const [lightboxFile, setLightboxFile] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const mySubmission = useSelector(selectMySubmission);
  const submissions = useSelector(selectSubmissions);
  const successMessage = useSelector(selectCoursesSuccess);

  useEffect(() => {
    if (token && id) {
      dispatch(getCourse({ id, token }));
    }
  }, [dispatch, token, id]);

  // Fetch my submission if user is a student and course is homework/activity
  useEffect(() => {
    if (token && id && userRole === "student" && course) {
      if (["homework", "activity"].includes(course.contentType)) {
        dispatch(getMySubmission({ courseId: id, token }));
      }
    }
  }, [dispatch, token, id, userRole, course]);

  // Fetch all submissions if user is teacher/admin and course is homework/activity
  useEffect(() => {
    if (
      token &&
      id &&
      (userRole === "admin" || userRole === "teacher") &&
      course
    ) {
      if (["homework", "activity"].includes(course.contentType)) {
        dispatch(getSubmissions({ courseId: id, status: filterStatus, token }));
      }
    }
  }, [dispatch, token, id, userRole, course, filterStatus]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearSuccessMessage());
        if (showGradeModal) {
          setShowGradeModal(false);
          setSelectedSubmission(null);
          setGrade("");
          setFeedback("");
          // Refresh submissions after grading
          if (token && id) {
            dispatch(
              getSubmissions({ courseId: id, status: filterStatus, token })
            );
          }
        }
      }, 2000);
    }
  }, [successMessage, dispatch, showGradeModal, token, id, filterStatus]);

  // Cleanup: restore body scroll on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 " + t("pages.courseView.fileSizes.bytes");
    const k = 1024;
    const sizes = [
      t("pages.courseView.fileSizes.bytes"),
      t("pages.courseView.fileSizes.kb"),
      t("pages.courseView.fileSizes.mb"),
      t("pages.courseView.fileSizes.gb"),
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getContentTypeIcon = (contentTypes) => {
    if (!contentTypes || contentTypes.length === 0) {
      return <i className="bi bi-file-earmark fs-1"></i>;
    }
    
    if (contentTypes.length === 1) {
      switch (contentTypes[0]) {
        case "video":
          return <i className="bi bi-play-circle-fill text-danger fs-1"></i>;
        case "material":
          return <i className="bi bi-file-earmark-text-fill text-primary fs-1"></i>;
        case "homework":
          return <i className="bi bi-clipboard-check-fill text-success fs-1"></i>;
        case "activity":
          return <i className="bi bi-activity-fill text-warning fs-1"></i>;
        default:
          return <i className="bi bi-file-earmark fs-1"></i>;
      }
    }
    
    // Multiple content types
    return <i className="bi bi-stack text-info fs-1"></i>;
  };

  const getContentTypeBadges = (contentTypes) => {
    if (!contentTypes || contentTypes.length === 0) {
      return <span className="badge bg-secondary fs-6">Unknown</span>;
    }

    return contentTypes.map((contentType, index) => {
      let badgeClass = "bg-secondary";
      let label = contentType;

      switch (contentType) {
        case "video":
          badgeClass = "bg-danger";
          label = t("pages.courseView.contentTypes.video");
          break;
        case "material":
          badgeClass = "bg-primary";
          label = t("pages.courseView.contentTypes.material");
          break;
        case "homework":
          badgeClass = "bg-success";
          label = t("pages.courseView.contentTypes.homework");
          break;
        case "activity":
          badgeClass = "bg-warning";
          label = t("pages.courseView.contentTypes.activity");
          break;
      }

      return (
        <span key={index} className={`badge ${badgeClass} fs-6 me-1`}>
          {label}
        </span>
      );
    });
  };

  const isVideoOrAudio = (mimeType) => {
    if (!mimeType) return false;
    return mimeType.startsWith("video/") || mimeType.startsWith("audio/");
  };

  const canViewInLightbox = (mimeType) => {
    if (!mimeType) return false;
    return (
      mimeType === "application/pdf" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation" || // PPTX
      mimeType === "application/vnd.ms-powerpoint" || // PPT
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // DOCX
      mimeType === "application/msword" || // DOC
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // XLSX
      mimeType === "application/vnd.ms-excel" || // XLS
      mimeType === "text/plain" || // TXT
      mimeType.startsWith("image/") // Images
    );
  };

  const getViewerUrl = (file) => {
    const fileUrl = `${import.meta.env.VITE_BACKEND_URL}${file.url}`;

    // For PDFs, use direct URL
    if (file.mimeType === "application/pdf") {
      return fileUrl;
    }

    // For Office documents, use Google Docs Viewer
    if (
      file.mimeType.includes("presentation") ||
      file.mimeType.includes("wordprocessing") ||
      file.mimeType.includes("spreadsheet") ||
      file.mimeType.includes("msword") ||
      file.mimeType.includes("ms-excel") ||
      file.mimeType.includes("ms-powerpoint")
    ) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(
        fileUrl
      )}&embedded=true`;
    }

    // For images, use direct URL
    if (file.mimeType.startsWith("image/")) {
      return fileUrl;
    }

    // For text files, use direct URL
    if (file.mimeType === "text/plain") {
      return fileUrl;
    }

    return fileUrl;
  };

  const handleDownload = async (sectionIndex, fileIndex, fileName) => {
    try {
      console.log("Starting download for:", fileName);

      // Use the new dedicated download endpoint with section and file indices
      const downloadUrl = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/courses/download/${id}/${sectionIndex}/${fileIndex}`;

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      // Get the blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "download";
      link.style.display = "none";

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log("Download completed successfully");
    } catch (error) {
      console.error("Download failed:", error);
      alert(
        `Failed to download ${fileName}. Please try again or contact support.`
      );
    }
  };

  const handleViewFile = (file) => {
    setLightboxFile(file);
    setIsLightboxOpen(true);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxFile(null);
    // Restore body scroll
    document.body.style.overflow = "auto";
  };

  const handleGradeClick = (submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || "");
    setFeedback(submission.feedback || "");
    setShowGradeModal(true);
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (selectedSubmission) {
      dispatch(
        gradeSubmission({
          courseId: id,
          submissionId: selectedSubmission._id,
          grade: grade ? parseFloat(grade) : undefined,
          feedback: feedback || undefined,
          token,
        })
      );
    }
  };

  const handleDownloadSubmissionFile = async (
    submissionId,
    fileIndex,
    fileName
  ) => {
    try {
      console.log("Starting submission file download for:", fileName);

      // Use the new dedicated submission download endpoint
      const downloadUrl = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/courses/download-submission/${submissionId}/${fileIndex}`;

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      // Get the blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "download";
      link.style.display = "none";

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log("Submission file download completed successfully");
    } catch (error) {
      console.error("Submission file download failed:", error);
      alert(
        `Failed to download ${fileName}. Please try again or contact support.`
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "graded":
        return <span className="badge bg-success">Graded</span>;
      case "submitted":
        return <span className="badge bg-warning">Submitted</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const filteredSubmissions = filterStatus
    ? submissions.filter((s) => s.status === filterStatus)
    : submissions;

  // Close lightbox on Escape key
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
        setLightboxFile(null);
        document.body.style.overflow = "auto";
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isLightboxOpen]);

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-light">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">{t("pages.courseView.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-light">
        <div className="text-center">
          <i
            className="bi bi-exclamation-triangle-fill text-danger mb-3"
            style={{ fontSize: "4rem" }}
          ></i>
          <h3 className="text-danger mb-3">
            {t("pages.courseView.errorTitle")}
          </h3>
          <p className="text-muted mb-4">{error}</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>
            {t("pages.courseView.goBack")}
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-light">
        <div className="text-center">
          <i
            className="bi bi-inbox text-muted mb-3"
            style={{ fontSize: "4rem" }}
          ></i>
          <h3 className="text-muted mb-3">
            {t("pages.courseView.notFoundTitle")}
          </h3>
          <p className="text-muted mb-4">
            {t("pages.courseView.notFoundMessage")}
          </p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>
            {t("pages.courseView.goBack")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-gradient-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12">
            <button
              className="btn btn-outline-primary mb-3"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              {t("pages.courseView.backToCourses")}
            </button>

            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                {/* Course Header */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      {getContentTypeIcon(course.contentSections?.map(s => s.contentType) || [])}
                      <div className="d-flex flex-wrap gap-1">
                        {getContentTypeBadges(course.contentSections?.map(s => s.contentType) || [])}
                      </div>
                    </div>
                    <h1 className="display-5 fw-bold mb-3 text-primary">
                      {course.title}
                    </h1>
                    <p className="text-muted mb-3">
                      <i className="bi bi-bookmark-fill me-2"></i>
                      <strong>{t("pages.courseView.subject")}:</strong>{" "}
                      {course.subject}
                    </p>
                    <p className="text-muted mb-3">
                      <i className="bi bi-person-fill me-2"></i>
                      <strong>{t("pages.courseView.createdBy")}:</strong>{" "}
                      {course.createdBy?.fullName || "Admin"}
                    </p>
                    <p className="text-muted mb-3">
                      <i className="bi bi-calendar me-2"></i>
                      <strong>{t("pages.courseView.created")}:</strong>{" "}
                      {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {/* Course Description */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h3 className="fw-bold mb-3 text-primary">
                      <i className="bi bi-file-text me-2"></i>
                      {t("pages.courseView.description")}
                    </h3>
                    <div className="bg-light p-4 rounded-3">
                      <p className="mb-0">{course.description}</p>
                    </div>
                  </div>
                </div>
                {/* Media Players for Video/Audio Files */}
                {course.contentSections &&
                  course.contentSections.some((section) =>
                    section.files?.some((file) => isVideoOrAudio(file.mimeType))
                  ) && (
                    <div className="row mb-4">
                      <div className="col-12">
                        <h3 className="fw-bold mb-3 text-primary">
                          <i className="bi bi-play-circle me-2"></i>
                          {t("pages.courseView.mediaPlayer")}
                        </h3>
                        {course.contentSections
                          .filter((section) =>
                            section.files?.some((file) => isVideoOrAudio(file.mimeType))
                          )
                          .map((section, sectionIndex) => (
                            <div key={sectionIndex} className="mb-4">
                              <h5 className="fw-semibold mb-3 text-secondary">
                                {section.title}
                              </h5>
                              {section.files
                                .filter((file) => isVideoOrAudio(file.mimeType))
                                .map((file, fileIndex) => (
                                  <div
                                    key={fileIndex}
                                    className="bg-dark rounded-3 p-4 text-center mb-3"
                                  >
                                    <p className="text-white mb-2">
                                      {file.originalFileName}
                                    </p>
                                    {file.mimeType.startsWith("video/") ? (
                                      <video
                                        controls
                                        className="w-100 rounded"
                                        style={{ maxHeight: "500px" }}
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                      >
                                        <source
                                          src={`${import.meta.env.VITE_BACKEND_URL}${
                                            file.url
                                          }`}
                                          type={file.mimeType}
                                        />
                                        Your browser does not support the video tag.
                                      </video>
                                    ) : (
                                      <audio
                                        controls
                                        className="w-100"
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                      >
                                        <source
                                          src={`${import.meta.env.VITE_BACKEND_URL}${
                                            file.url
                                          }`}
                                          type={file.mimeType}
                                        />
                                        Your browser does not support the audio tag.
                                      </audio>
                                    )}
                                  </div>
                                ))}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                {/* Content Sections */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h3 className="fw-bold mb-3 text-primary">
                      <i className="bi bi-files me-2"></i>
                      Content Sections ({course.contentSections?.length || 0})
                    </h3>
                    {course.contentSections && course.contentSections.length > 0 ? (
                      <div className="accordion" id="contentSectionsAccordion">
                        {course.contentSections.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="accordion-item mb-3 border rounded-3">
                            <h2 className="accordion-header">
                              <button
                                className="accordion-button"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#section-${sectionIndex}`}
                                aria-expanded={sectionIndex === 0}
                                aria-controls={`section-${sectionIndex}`}
                              >
                                <div className="d-flex align-items-center w-100">
                                  <div className="me-3">
                                    {getContentTypeIcon([section.contentType])}
                                  </div>
                                  <div className="flex-grow-1">
                                    <h5 className="mb-1 fw-bold">{section.title}</h5>
                                    {section.description && (
                                      <p className="mb-0 text-muted small">
                                        {section.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="ms-3">
                                    {getContentTypeBadges([section.contentType])}
                                  </div>
                                </div>
                              </button>
                            </h2>
                            <div
                              id={`section-${sectionIndex}`}
                              className={`accordion-collapse collapse ${sectionIndex === 0 ? 'show' : ''}`}
                              data-bs-parent="#contentSectionsAccordion"
                            >
                              <div className="accordion-body">
                                {section.files && section.files.length > 0 ? (
                                  <div className="row g-3">
                                    {section.files.map((file, fileIndex) => (
                                      <div key={fileIndex} className="col-md-6 col-lg-4">
                                        <div className="bg-light p-3 rounded-3 h-100">
                                          <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="flex-grow-1">
                                              <p className="mb-1 text-muted small">
                                                {t("pages.courseView.fileName")}
                                              </p>
                                              <p className="fw-semibold mb-2 small">
                                                {file.originalFileName}
                                              </p>
                                            </div>
                                            {isVideoOrAudio(file.mimeType) && (
                                              <i className="bi bi-play-circle-fill text-primary"></i>
                                            )}
                                          </div>
                                          <div className="row g-2">
                                            <div className="col-12">
                                              <p className="mb-1 text-muted small">
                                                {t("pages.courseView.fileSize")}
                                              </p>
                                              <p className="fw-semibold mb-0 small">
                                                {formatFileSize(file.fileSize)}
                                              </p>
                                            </div>
                                            <div className="col-12">
                                              <p className="mb-1 text-muted small">
                                                {t("pages.courseView.fileType")}
                                              </p>
                                              <p className="fw-semibold mb-0 small">
                                                {file.mimeType}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="mt-3 d-flex gap-2">
                                            <button
                                              className="btn btn-primary btn-sm flex-grow-1"
                                              onClick={() =>
                                                handleDownload(sectionIndex, fileIndex, file.originalFileName)
                                              }
                                            >
                                              <i className="bi bi-download me-1"></i>
                                              Download
                                            </button>
                                            {!isVideoOrAudio(file.mimeType) &&
                                              canViewInLightbox(file.mimeType) && (
                                                <button
                                                  className="btn btn-outline-primary btn-sm"
                                                  onClick={() => handleViewFile(file)}
                                                  title="View in lightbox"
                                                >
                                                  <i className="bi bi-eye"></i>
                                                </button>
                                              )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="bg-light p-4 rounded-3 text-center">
                                    <p className="text-muted mb-0">
                                      No files available in this section.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-light p-4 rounded-3 text-center">
                        <p className="text-muted mb-0">
                          No content sections available for this course.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Submission Section for Students */}
                {userRole === "student" &&
                  course.contentSections?.some(section => 
                    ["homework", "activity"].includes(section.contentType)
                  ) && (
                    <div className="row mb-4">
                      <div className="col-12">
                        <h3 className="fw-bold mb-3 text-primary">
                          <i className="bi bi-send-fill me-2"></i>
                          My Submission
                        </h3>
                        {mySubmission ? (
                          <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                              <div className="row mb-3">
                                <div className="col-md-6">
                                  <p className="mb-1 text-muted">Status</p>
                                  <span
                                    className={`badge ${
                                      mySubmission.status === "graded"
                                        ? "bg-success"
                                        : mySubmission.status === "submitted"
                                        ? "bg-warning"
                                        : "bg-secondary"
                                    } fs-6`}
                                  >
                                    {mySubmission.status
                                      .charAt(0)
                                      .toUpperCase() +
                                      mySubmission.status.slice(1)}
                                  </span>
                                </div>
                                {mySubmission.grade !== undefined && (
                                  <div className="col-md-6">
                                    <p className="mb-1 text-muted">Grade</p>
                                    <h5 className="mb-0 fw-bold text-primary">
                                      {mySubmission.grade}/100
                                    </h5>
                                  </div>
                                )}
                              </div>

                              {mySubmission.feedback && (
                                <div className="mb-3">
                                  <p className="mb-1 text-muted">Feedback</p>
                                  <div className="bg-light p-3 rounded">
                                    <p className="mb-0">
                                      {mySubmission.feedback}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {mySubmission.submittedFiles &&
                                mySubmission.submittedFiles.length > 0 && (
                                  <div className="mb-3">
                                    <p className="mb-2 text-muted">
                                      Submitted Files (
                                      {mySubmission.submittedFiles.length})
                                    </p>
                                    <div className="row g-2">
                                      {mySubmission.submittedFiles.map(
                                        (file, index) => (
                                          <div key={index} className="col-md-6">
                                            <div className="bg-light p-2 rounded d-flex justify-content-between align-items-center">
                                              <small className="text-muted">
                                                {file.originalFileName}
                                              </small>
                                              <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() =>
                                                  handleDownloadSubmissionFile(
                                                    mySubmission._id,
                                                    index,
                                                    file.originalFileName
                                                  )
                                                }
                                              >
                                                <i className="bi bi-download"></i>
                                              </button>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              <div className="d-flex gap-2">
                                {mySubmission.status !== "graded" && (
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => setShowSubmitModal(true)}
                                  >
                                    <i className="bi bi-pencil me-2"></i>
                                    {mySubmission.status === "submitted"
                                      ? "Update Submission"
                                      : "Submit"}
                                  </button>
                                )}
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={() => setShowSubmitModal(true)}
                                >
                                  <i className="bi bi-eye me-2"></i>
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="card border-0 shadow-sm">
                            <div className="card-body p-4 text-center">
                              <i
                                className="bi bi-inbox text-muted mb-3"
                                style={{ fontSize: "3rem" }}
                              ></i>
                              <p className="text-muted mb-3">
                                You haven't submitted your work yet.
                              </p>
                              <button
                                className="btn btn-primary btn-lg"
                                onClick={() => setShowSubmitModal(true)}
                              >
                                <i className="bi bi-upload me-2"></i>
                                Submit Work
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Submissions Section for Teachers/Admins */}
                {(userRole === "admin" || userRole === "teacher") &&
                  course.contentSections?.some(section => 
                    ["homework", "activity"].includes(section.contentType)
                  ) && (
                    <div className="row mb-4">
                      <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h3 className="fw-bold mb-0 text-primary">
                            <i className="bi bi-people-fill me-2"></i>
                            Student Submissions ({submissions.length})
                          </h3>
                          <select
                            className="form-select form-select-sm"
                            style={{ width: "auto" }}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <option value="">All Status</option>
                            <option value="submitted">Submitted</option>
                            <option value="graded">Graded</option>
                          </select>
                        </div>

                        {isLoading && submissions.length === 0 ? (
                          <div className="text-center py-4">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </div>
                        ) : filteredSubmissions.length === 0 ? (
                          <div className="card border-0 shadow-sm">
                            <div className="card-body p-4 text-center">
                              <i
                                className="bi bi-inbox text-muted mb-3"
                                style={{ fontSize: "3rem" }}
                              ></i>
                              <p className="text-muted mb-0">
                                {filterStatus
                                  ? `No ${filterStatus} submissions found`
                                  : "No submissions found yet"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="row g-3">
                            {filteredSubmissions.map((submission) => (
                              <div
                                key={submission._id}
                                className="col-md-6 col-lg-4"
                              >
                                <div className="card border-0 shadow-sm h-100">
                                  <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <div className="flex-grow-1">
                                        <h6 className="mb-1 fw-bold">
                                          {submission.student?.fullName ||
                                            "Unknown"}
                                        </h6>
                                        <small className="text-muted">
                                          {submission.student?.email}
                                        </small>
                                      </div>
                                      {getStatusBadge(submission.status)}
                                    </div>

                                    <div className="mb-2">
                                      <small className="text-muted d-block">
                                        <i className="bi bi-calendar me-1"></i>
                                        Submitted:{" "}
                                        {new Date(
                                          submission.submittedAt
                                        ).toLocaleDateString()}
                                      </small>
                                      {submission.grade !== undefined && (
                                        <small className="text-muted d-block mt-1">
                                          <i className="bi bi-star-fill me-1 text-warning"></i>
                                          Grade:{" "}
                                          <strong className="text-success">
                                            {submission.grade}/100
                                          </strong>
                                        </small>
                                      )}
                                    </div>

                                    <div className="mb-2">
                                      <small className="text-muted">
                                        <i className="bi bi-file-earmark me-1"></i>
                                        {submission.submittedFiles?.length || 0}{" "}
                                        file(s)
                                      </small>
                                    </div>

                                    {submission.feedback && (
                                      <div className="mb-2">
                                        <small className="text-muted d-block mb-1">
                                          Feedback:
                                        </small>
                                        <div className="bg-light p-2 rounded small">
                                          {submission.feedback.length > 50
                                            ? `${submission.feedback.substring(
                                                0,
                                                50
                                              )}...`
                                            : submission.feedback}
                                        </div>
                                      </div>
                                    )}

                                    <div className="d-flex gap-2 mt-3">
                                      <button
                                        className="btn btn-primary btn-sm flex-grow-1"
                                        onClick={() =>
                                          handleGradeClick(submission)
                                        }
                                      >
                                        <i className="bi bi-pencil-square me-1"></i>
                                        {submission.status === "graded"
                                          ? "View/Grade"
                                          : "Grade"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && lightboxFile && (
        <div
          className="lightbox-overlay"
          onClick={handleCloseLightbox}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "95vw",
              height: "95vh",
              backgroundColor: "#fff",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Lightbox Header */}
            <div
              style={{
                padding: "15px 20px",
                borderBottom: "1px solid #dee2e6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8f9fa",
              }}
            >
              <h5 className="mb-0 fw-bold">{lightboxFile.originalFileName}</h5>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={handleCloseLightbox}
                style={{ border: "none" }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Lightbox Body */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                position: "relative",
                backgroundColor: "#fff",
              }}
            >
              {lightboxFile.mimeType === "application/pdf" ? (
                <iframe
                  src={getViewerUrl(lightboxFile)}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  title={lightboxFile.originalFileName}
                />
              ) : lightboxFile.mimeType.startsWith("image/") ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    padding: "20px",
                  }}
                >
                  <img
                    src={getViewerUrl(lightboxFile)}
                    alt={lightboxFile.originalFileName}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ) : lightboxFile.mimeType === "text/plain" ? (
                <iframe
                  src={getViewerUrl(lightboxFile)}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  title={lightboxFile.originalFileName}
                />
              ) : (
                <iframe
                  src={getViewerUrl(lightboxFile)}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  title={lightboxFile.originalFileName}
                />
              )}
            </div>

            {/* Lightbox Footer */}
            <div
              style={{
                padding: "15px 20px",
                borderTop: "1px solid #dee2e6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8f9fa",
              }}
            >
              <small className="text-muted">
                {formatFileSize(lightboxFile.fileSize)} •{" "}
                {lightboxFile.mimeType}
              </small>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  // Find the section and file indices for the lightbox file
                  let sectionIndex = -1;
                  let fileIndex = -1;
                  
                  course.contentSections?.forEach((section, secIdx) => {
                    const fIdx = section.files?.findIndex((f) => f.url === lightboxFile.url);
                    if (fIdx !== -1) {
                      sectionIndex = secIdx;
                      fileIndex = fIdx;
                    }
                  });
                  
                  if (sectionIndex !== -1 && fileIndex !== -1) {
                    handleDownload(sectionIndex, fileIndex, lightboxFile.originalFileName);
                  }
                }}
              >
                <i className="bi bi-download me-1"></i>
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Homework Modal */}
      {showSubmitModal && (
        <SubmitHomework
          courseId={id}
          existingSubmission={mySubmission}
          onSuccess={() => {
            // Refresh submission after successful submit
            if (token && id) {
              dispatch(getMySubmission({ courseId: id, token }));
            }
          }}
          onClose={() => setShowSubmitModal(false)}
        />
      )}

      {/* Grade Submission Modal */}
      {showGradeModal && selectedSubmission && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 10000,
          }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-star-fill me-2 text-warning"></i>
                  Grade Submission
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowGradeModal(false);
                    setSelectedSubmission(null);
                    setGrade("");
                    setFeedback("");
                  }}
                  disabled={isLoading}
                ></button>
              </div>

              <form onSubmit={handleGradeSubmit}>
                <div className="modal-body">
                  {successMessage && (
                    <div
                      className="alert alert-success alert-dismissible fade show"
                      role="alert"
                    >
                      <i className="bi bi-check-circle-fill me-2"></i>
                      {successMessage}
                    </div>
                  )}

                  {error && (
                    <div
                      className="alert alert-danger alert-dismissible fade show"
                      role="alert"
                    >
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Student</label>
                    <p className="mb-0">
                      <strong>{selectedSubmission.student?.fullName}</strong>
                      <br />
                      <small className="text-muted">
                        {selectedSubmission.student?.email}
                      </small>
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Submitted Files (
                      {selectedSubmission.submittedFiles?.length || 0})
                    </label>
                    <div className="list-group">
                      {selectedSubmission.submittedFiles?.map((file, index) => (
                        <div
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div className="flex-grow-1">
                            <small className="fw-semibold">
                              {file.originalFileName}
                            </small>
                            <br />
                            <small className="text-muted">
                              {formatFileSize(file.fileSize)}
                            </small>
                          </div>
                          <div className="d-flex gap-2">
                            {canViewInLightbox(file.mimeType) && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info"
                                onClick={() => handleViewFile(file)}
                                title="View"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                handleDownloadSubmissionFile(
                                  selectedSubmission._id,
                                  index,
                                  file.originalFileName
                                )
                              }
                              title="Download"
                            >
                              <i className="bi bi-download"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="grade" className="form-label fw-semibold">
                        Grade (0-100)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="grade"
                        min="0"
                        max="100"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="Enter grade"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Status</label>
                      <div>{getStatusBadge(selectedSubmission.status)}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="feedback"
                      className="form-label fw-semibold"
                    >
                      Feedback
                    </label>
                    <textarea
                      className="form-control"
                      id="feedback"
                      rows="4"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Enter feedback for the student..."
                    ></textarea>
                  </div>

                  {selectedSubmission.gradedBy && (
                    <div className="alert alert-info">
                      <small>
                        <strong>Graded by:</strong>{" "}
                        {selectedSubmission.gradedBy?.fullName}
                        {selectedSubmission.gradedAt && (
                          <>
                            <br />
                            <strong>Graded on:</strong>{" "}
                            {new Date(
                              selectedSubmission.gradedAt
                            ).toLocaleString()}
                          </>
                        )}
                      </small>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowGradeModal(false);
                      setSelectedSubmission(null);
                      setGrade("");
                      setFeedback("");
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Save Grade
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseView;
