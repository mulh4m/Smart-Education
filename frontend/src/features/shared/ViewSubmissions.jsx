import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSubmissions,
  gradeSubmission,
  selectSubmissions,
  selectCoursesLoading,
  selectCoursesError,
  selectCoursesSuccess,
  clearSuccessMessage,
  clearError,
} from "../../store/slices/courseSlice";
import { selectToken } from "../../store/slices/authSlice";

const ViewSubmissions = ({ courseId, courseTitle, onClose }) => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const submissions = useSelector(selectSubmissions);
  const isLoading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);
  const successMessage = useSelector(selectCoursesSuccess);

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (token && courseId) {
      dispatch(getSubmissions({ courseId, status: filterStatus, token }));
    }
  }, [dispatch, token, courseId, filterStatus]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearSuccessMessage());
        setShowGradeModal(false);
        setSelectedSubmission(null);
        setGrade("");
        setFeedback("");
        // Refresh submissions
        dispatch(getSubmissions({ courseId, status: filterStatus, token }));
      }, 2000);
    }
  }, [successMessage, dispatch, courseId, filterStatus, token]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

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
          courseId,
          submissionId: selectedSubmission._id,
          grade: grade ? parseFloat(grade) : undefined,
          feedback: feedback || undefined,
          token,
        })
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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

  const handleDownload = (file) => {
    const fullUrl = `${import.meta.env.VITE_BACKEND_URL}${file.url}`;
    const link = document.createElement("a");
    link.href = fullUrl;
    link.download = file.originalFileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubmissions = filterStatus
    ? submissions.filter((s) => s.status === filterStatus)
    : submissions;

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                <i className="bi bi-people-fill me-2 text-primary"></i>
                Submissions - {courseTitle}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={isLoading}
              ></button>
            </div>

            <div className="modal-body">
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
                </div>
              )}

              {/* Filter */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="graded">Graded</option>
                  </select>
                </div>
                <div className="col-md-8 text-end">
                  <span className="badge bg-primary fs-6">
                    Total: {submissions.length} submission(s)
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-5">
                  <i
                    className="bi bi-inbox text-muted mb-3"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <p className="text-muted">
                    {filterStatus
                      ? `No ${filterStatus} submissions found`
                      : "No submissions found"}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Status</th>
                        <th>Files</th>
                        <th>Submitted</th>
                        <th>Grade</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((submission) => (
                        <tr key={submission._id}>
                          <td>
                            <div>
                              <strong>{submission.student?.fullName || "Unknown"}</strong>
                              <br />
                              <small className="text-muted">
                                {submission.student?.email}
                              </small>
                            </div>
                          </td>
                          <td>{getStatusBadge(submission.status)}</td>
                          <td>
                            <span className="badge bg-info">
                              {submission.submittedFiles?.length || 0} file(s)
                            </span>
                          </td>
                          <td>
                            <small>
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            {submission.grade !== undefined ? (
                              <span className="badge bg-success fs-6">
                                {submission.grade}/100
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleGradeClick(submission)}
                                title="Grade/View"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 10001,
          }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
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
                  }}
                  disabled={isLoading}
                ></button>
              </div>

              <form onSubmit={handleGradeSubmit}>
                <div className="modal-body">
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
                      Submitted Files ({selectedSubmission.submittedFiles?.length || 0})
                    </label>
                    <div className="list-group">
                      {selectedSubmission.submittedFiles?.map((file, index) => (
                        <div
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <small className="fw-semibold">{file.originalFileName}</small>
                            <br />
                            <small className="text-muted">
                              {formatFileSize(file.fileSize)}
                            </small>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleDownload(file)}
                          >
                            <i className="bi bi-download"></i>
                          </button>
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
                    <label htmlFor="feedback" className="form-label fw-semibold">
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
                            {new Date(selectedSubmission.gradedAt).toLocaleString()}
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
    </>
  );
};

export default ViewSubmissions;

