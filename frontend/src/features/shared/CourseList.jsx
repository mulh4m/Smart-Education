import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getCourses,
  deleteCourse,
  getSubmissions,
  selectCourses,
  selectSubmissions,
  selectCoursesLoading,
  selectCoursesError,
  selectCoursesSuccess,
  clearSuccessMessage,
  clearError,
} from "../../store/slices/courseSlice";
import { selectToken, selectUserRole } from "../../store/slices/authSlice";
import ViewSubmissions from "./ViewSubmissions";
import UpdateCourse from "./UpdateCourse";

const CourseList = ({ onEdit, onCreateCourse }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const courses = useSelector(selectCourses);
  const token = useSelector(selectToken);
  const userRole = useSelector(selectUserRole);
  const isLoading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);
  const successMessage = useSelector(selectCoursesSuccess);

  const [filterSubject, setFilterSubject] = useState("");
  const [filterContentType, setFilterContentType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [submissionCounts, setSubmissionCounts] = useState({});
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [courseToUpdate, setCourseToUpdate] = useState(null);

  useEffect(() => {
    if (token) {
      const filters = {};
      if (filterSubject) filters.subject = filterSubject;
      if (filterContentType) filters.contentType = filterContentType;
      if (searchTerm) filters.search = searchTerm;

      dispatch(getCourses({ filters, token }));
    }
  }, [dispatch, token, filterSubject, filterContentType, searchTerm]);

  // Fetch submission counts for homework/activity courses (teachers/admins only)
  useEffect(() => {
    if (token && (userRole === "admin" || userRole === "teacher")) {
      const homeworkActivityCourses = courses.filter(
        (course) =>
          course.contentType === "homework" || course.contentType === "activity"
      );

      homeworkActivityCourses.forEach(async (course) => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/courses/${
              course._id
            }/submissions`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setSubmissionCounts((prev) => ({
              ...prev,
              [course._id]: data.results || 0,
            }));
          }
        } catch (error) {
          console.error(
            `Error fetching submissions for course ${course._id}:`,
            error
          );
        }
      });
    }
  }, [token, userRole, courses]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  const handleDelete = (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      dispatch(deleteCourse({ id: courseId, token }));
    }
  };

  const handleDownload = async (courseId, fileIndex, fileName) => {
    try {
      console.log("Starting download for:", fileName);
      
      // Use the new dedicated download endpoint
      const downloadUrl = `${import.meta.env.VITE_BACKEND_URL}/api/courses/download/${courseId}/${fileIndex}`;
      
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
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'download';
      link.style.display = 'none';
      
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
      alert(`Failed to download ${fileName}. Please try again or contact support.`);
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleViewSubmissions = (course) => {
    setSelectedCourse(course);
    setShowSubmissionsModal(true);
  };

  const handleUpdateCourse = (course) => {
    setCourseToUpdate(course);
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setCourseToUpdate(null);
    // Refresh courses list
    if (token) {
      const filters = {};
      if (filterSubject) filters.subject = filterSubject;
      if (filterContentType) filters.contentType = filterContentType;
      if (searchTerm) filters.search = searchTerm;
      dispatch(getCourses({ filters, token }));
    }
  };

  const handleUpdateCancel = () => {
    setShowUpdateModal(false);
    setCourseToUpdate(null);
  };

  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case "video":
        return <i className="bi bi-play-circle-fill text-danger fs-4"></i>;
      case "material":
        return (
          <i className="bi bi-file-earmark-text-fill text-primary fs-4"></i>
        );
      case "homework":
        return <i className="bi bi-clipboard-check-fill text-success fs-4"></i>;
      case "activity":
        return (
          <i className="bi bi-lightning-charge-fill text-warning fs-4"></i>
        );
      default:
        return <i className="bi bi-file-earmark fs-4"></i>;
    }
  };

  const getContentTypeBadge = (contentType) => {
    switch (contentType) {
      case "video":
        return <span className="badge bg-danger">Video</span>;
      case "material":
        return <span className="badge bg-primary">Material</span>;
      case "homework":
        return <span className="badge bg-success">Homework</span>;
      case "activity":
        return <span className="badge bg-warning">Activity</span>;
      default:
        return <span className="badge bg-secondary">{contentType}</span>;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const canEditDelete = userRole === "admin" || userRole === "teacher";

  // Get unique subjects for filter
  const uniqueSubjects = [...new Set(courses.map((course) => course.subject))];

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="fw-bold mb-0">
              <i className="bi bi-collection-fill text-primary me-2"></i>
              All Courses
            </h2>
            <div className="d-flex align-items-center gap-3">
              <div className="badge bg-primary fs-6">
                {courses.length} Courses
              </div>
              {canEditDelete && onCreateCourse && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={onCreateCourse}
                  title="Create New Course"
                >
                  <i className="bi bi-plus-circle-fill me-1"></i>
                  Create Course
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => dispatch(clearError())}
          ></button>
        </div>
      )}

      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => dispatch(clearSuccessMessage())}
          ></button>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <select
            className="form-select"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {uniqueSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-3">
          <select
            className="form-select"
            value={filterContentType}
            onChange={(e) => setFilterContentType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="video">Video</option>
            <option value="material">Material</option>
            <option value="homework">Homework</option>
            <option value="activity">Activity</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {courses.length === 0 ? (
            <div className="col-12">
              <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
                <p className="text-muted">No courses found</p>
              </div>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course._id} className="col-lg-6 col-xl-4">
                <div className="card h-100 border-0 shadow-sm course-card-enhanced">
                  <div className="card-body p-4">
                    {/* Enhanced Header with Gradient Background */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="fs-2">
                        {getContentTypeIcon(course.contentType)}
                      </div>
                      <div className="d-flex flex-column align-items-end">
                        {getContentTypeBadge(course.contentType)}
                        <small className="text-muted mt-1">
                          <i className="bi bi-person-fill me-1"></i>
                          {course.createdBy?.fullName || "Unknown"}
                        </small>
                      </div>
                    </div>

                    {/* Course Title with Better Typography */}
                    <h5
                      className="card-title fw-bold mb-2"
                      style={{ color: "#2c3e50", lineHeight: "1.3" }}
                    >
                      {course.title}
                    </h5>

                    {/* Subject with Icon */}
                    <p className="text-muted small mb-2">
                      <i className="bi bi-bookmark-fill me-1 text-primary"></i>
                      <strong>Subject:</strong> {course.subject}
                    </p>

                    {/* Enhanced Description */}
                    <p
                      className="card-text text-muted small mb-3"
                      style={{ lineHeight: "1.5" }}
                    >
                      {course.description.length > 100
                        ? `${course.description.substring(0, 100)}...`
                        : course.description}
                    </p>

                    {/* Enhanced Meta Information */}
                    <div className="bg-light p-3 rounded-3 mb-3">
                      <div className="row g-2 text-center">
                        <div className="col-6">
                          <div className="d-flex align-items-center justify-content-center">
                            <i className="bi bi-file-earmark text-primary me-1"></i>
                            <small className="text-muted">
                              {course.contentFiles &&
                              course.contentFiles.length > 0
                                ? formatFileSize(
                                    course.contentFiles.reduce(
                                      (total, file) =>
                                        total + (file.fileSize || 0),
                                      0
                                    )
                                  )
                                : "0 Bytes"}
                            </small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="d-flex align-items-center justify-content-center">
                            <i className="bi bi-calendar text-success me-1"></i>
                            <small className="text-muted">
                              {new Date(course.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </div>
                      {/* Submission Count for Homework/Activity */}
                      {(course.contentType === "homework" ||
                        course.contentType === "activity") &&
                        (userRole === "admin" || userRole === "teacher") && (
                          <div className="mt-2 pt-2 border-top text-center">
                            <div className="d-flex align-items-center justify-content-center">
                              <i className="bi bi-people-fill text-info me-1"></i>
                              <small className="text-muted">
                                <strong>
                                  {submissionCounts[course._id] !== undefined
                                    ? submissionCounts[course._id]
                                    : "..."}{" "}
                                  submission(s)
                                </strong>
                              </small>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleViewCourse(course._id)}
                        title="View Course"
                        style={{ borderRadius: "20px" }}
                      >
                        <i className="bi bi-eye me-1"></i>
                        View
                      </button>
                      {(course.contentType === "homework" ||
                        course.contentType === "activity") &&
                        (userRole === "admin" || userRole === "teacher") && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleViewSubmissions(course)}
                            title="View Submissions"
                            style={{ borderRadius: "20px" }}
                          >
                            <i className="bi bi-people-fill me-1"></i>
                            Submissions
                            {submissionCounts[course._id] !== undefined &&
                              submissionCounts[course._id] > 0 && (
                                <span className="badge bg-danger ms-1">
                                  {submissionCounts[course._id]}
                                </span>
                              )}
                          </button>
                        )}
                      {course.contentFiles &&
                        course.contentFiles.length > 0 && (
                          <>
                            {course.contentFiles.length === 1 ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() =>
                                  handleDownload(
                                    course._id,
                                    0,
                                    course.contentFiles[0].originalFileName
                                  )
                                }
                                title="Download File"
                                style={{ borderRadius: "20px" }}
                              >
                                <i className="bi bi-download me-1"></i>
                                Download
                              </button>
                            ) : (
                              <div className="btn-group">
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() =>
                                    handleDownload(
                                      course._id,
                                      0,
                                      course.contentFiles[0].originalFileName
                                    )
                                  }
                                  title="Download First File"
                                  style={{ borderRadius: "20px 0 0 20px" }}
                                >
                                  <i className="bi bi-download me-1"></i>
                                  Download
                                </button>
                                <button
                                  className="btn btn-primary btn-sm dropdown-toggle dropdown-toggle-split"
                                  data-bs-toggle="dropdown"
                                  title="More Download Options"
                                  style={{ borderRadius: "0 20px 20px 0" }}
                                >
                                  <span className="visually-hidden">
                                    Toggle Dropdown
                                  </span>
                                </button>
                                <ul className="dropdown-menu">
                                  {course.contentFiles.map((file, index) => (
                                    <li key={index}>
                                      <button
                                        className="dropdown-item"
                                        onClick={() =>
                                          handleDownload(
                                            course._id,
                                            index,
                                            file.originalFileName
                                          )
                                        }
                                      >
                                        <i className="bi bi-file-earmark me-2"></i>
                                        {file.originalFileName}
                                      </button>
                                    </li>
                                  ))}
                                  <li>
                                    <hr className="dropdown-divider" />
                                  </li>
                                  <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => {
                                          course.contentFiles.forEach(
                                            (file, index) => {
                                              setTimeout(() => {
                                                handleDownload(
                                                  course._id,
                                                  index,
                                                  file.originalFileName
                                                );
                                              }, index * 500); // Stagger downloads by 500ms
                                            }
                                          );
                                        }}
                                      >
                                        <i className="bi bi-download me-2"></i>
                                        Download All Files
                                      </button>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </>
                        )}

                      {canEditDelete && (
                        <>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleUpdateCourse(course)}
                            title="Update Course"
                            style={{ borderRadius: "20px" }}
                          >
                            <i className="bi bi-pencil-square me-1"></i>
                            Update
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(course._id)}
                            title="Delete"
                            style={{ borderRadius: "20px" }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style jsx>{`
        .course-card-enhanced {
          transition: all 0.3s ease;
          border-radius: 15px !important;
        }
        .course-card-enhanced:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
        }
        .btn:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3) !important;
        }
      `}</style>

      {/* View Submissions Modal */}
      {showSubmissionsModal && selectedCourse && (
        <ViewSubmissions
          courseId={selectedCourse._id}
          courseTitle={selectedCourse.title}
          onClose={() => {
            setShowSubmissionsModal(false);
            setSelectedCourse(null);
            // Refresh submission counts
            if (token && (userRole === "admin" || userRole === "teacher")) {
              const homeworkActivityCourses = courses.filter(
                (course) =>
                  course.contentType === "homework" ||
                  course.contentType === "activity"
              );

              homeworkActivityCourses.forEach(async (course) => {
                try {
                  const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/courses/${
                      course._id
                    }/submissions`,
                    {
                      method: "GET",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  if (response.ok) {
                    const data = await response.json();
                    setSubmissionCounts((prev) => ({
                      ...prev,
                      [course._id]: data.results || 0,
                    }));
                  }
                } catch (error) {
                  console.error(
                    `Error fetching submissions for course ${course._id}:`,
                    error
                  );
                }
              });
            }
          }}
        />
      )}

      {/* Update Course Modal */}
      {showUpdateModal && courseToUpdate && (
        <UpdateCourse
          course={courseToUpdate}
          onSuccess={handleUpdateSuccess}
          onCancel={handleUpdateCancel}
        />
      )}
    </div>
  );
};

export default CourseList;
