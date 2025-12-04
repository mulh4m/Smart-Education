import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateCourse,
  selectCoursesLoading,
  selectCoursesError,
  selectCoursesSuccess,
  clearSuccessMessage,
  clearError,
} from "../../store/slices/courseSlice";
import { selectToken } from "../../store/slices/authSlice";

const UpdateCourse = ({ course, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const isLoading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);
  const successMessage = useSelector(selectCoursesSuccess);

  const [formData, setFormData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    subject: course?.subject || "",
    contentType: course?.contentType || "video",
  });

  const [fileInputs, setFileInputs] = useState([{ id: 1, file: null }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        subject: course.subject || "",
        contentType: course.contentType || "video",
      });
    }
  }, [course]);

  useEffect(() => {
    if (successMessage) {
      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
    }
  }, [successMessage, dispatch, onSuccess]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // Reset file inputs when content type changes
    if (name === "contentType") {
      setFileInputs([{ id: 1, file: null }]);
    }
  };

  const handleFileChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      setFileInputs((prev) =>
        prev.map((input) =>
          input.id === id ? { ...input, file } : input
        )
      );
      if (errors.files) {
        setErrors((prev) => ({
          ...prev,
          files: "",
        }));
      }
    }
  };

  const addFileInput = () => {
    const newId = Math.max(...fileInputs.map((input) => input.id), 0) + 1;
    setFileInputs((prev) => [...prev, { id: newId, file: null }]);
  };

  const removeFileInput = (id) => {
    if (fileInputs.length > 1) {
      setFileInputs((prev) => prev.filter((input) => input.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("subject", formData.subject);
      data.append("contentType", formData.contentType);
      
      // Append all selected files from all inputs (optional for updates)
      fileInputs.forEach((input) => {
        if (input.file) {
          data.append("content", input.file);
        }
      });

      dispatch(updateCourse({ id: course._id, formData: data, token }));
    }
  };

  const getAcceptedFileTypes = () => {
    switch (formData.contentType) {
      case "video":
        return ".mp4,.avi,.mov,.wmv,.mkv,.flv,.webm,.mp3,.wav,.ogg,.m4a";
      case "material":
      case "homework":
        return ".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.xls,.xlsx";
      case "activity":
        return ".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.xls,.xlsx";
      default:
        return "*";
    }
  };

  const getFileTypeLabel = () => {
    switch (formData.contentType) {
      case "video":
        return "Video/Audio File (Max: 100MB)";
      case "material":
        return "Material File (Max: 50MB)";
      case "homework":
        return "Homework File (Max: 50MB)";
      case "activity":
        return "Activity File (Max: 50MB)";
      default:
        return "File";
    }
  };

  if (!course) {
    return null;
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-pencil-square text-primary me-2"></i>
              Update Course
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
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
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => dispatch(clearSuccessMessage())}
                ></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="title" className="form-label fw-semibold">
                    Course Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.title ? "is-invalid" : ""
                    }`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter course title"
                  />
                  {errors.title && (
                    <div className="invalid-feedback">{errors.title}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="subject" className="form-label fw-semibold">
                    Subject <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.subject ? "is-invalid" : ""
                    }`}
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g., Mathematics, Science"
                  />
                  {errors.subject && (
                    <div className="invalid-feedback">{errors.subject}</div>
                  )}
                </div>

                <div className="col-12 mb-3">
                  <label
                    htmlFor="description"
                    className="form-label fw-semibold"
                  >
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${
                      errors.description ? "is-invalid" : ""
                    }`}
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Enter course description"
                  ></textarea>
                  {errors.description && (
                    <div className="invalid-feedback">
                      {errors.description}
                    </div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label
                    htmlFor="contentType"
                    className="form-label fw-semibold"
                  >
                    Content Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="contentType"
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleChange}
                  >
                    <option value="video">Video</option>
                    <option value="material">Material</option>
                    <option value="homework">Homework</option>
                    <option value="activity">Activity</option>
                  </select>
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label fw-semibold">
                    {getFileTypeLabel()} <span className="text-muted">(Optional - leave empty to keep existing files)</span>
                  </label>
                  {fileInputs.map((input, index) => (
                    <div key={input.id} className="mb-3">
                      <div className="d-flex gap-2 align-items-end">
                        <div className="flex-grow-1">
                          <input
                            type="file"
                            className="form-control"
                            id={`content-${input.id}`}
                            onChange={(e) => handleFileChange(input.id, e)}
                            accept={getAcceptedFileTypes()}
                          />
                          {input.file && (
                            <small className="text-muted d-block mt-1">
                              Selected: {input.file.name} (
                              {(input.file.size / (1024 * 1024)).toFixed(2)}{" "}
                              MB)
                            </small>
                          )}
                        </div>
                        {fileInputs.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => removeFileInput(input.id)}
                            title="Remove this file field"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={addFileInput}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Add Another File
                  </button>
                </div>

                {/* Display current files */}
                {course.contentFiles && course.contentFiles.length > 0 && (
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">Current Files:</label>
                    <div className="border rounded p-3 bg-light">
                      {course.contentFiles.map((file, index) => (
                        <div key={index} className="d-flex align-items-center mb-2">
                          <i className="bi bi-file-earmark text-primary me-2"></i>
                          <span className="me-2">{file.originalFileName}</span>
                          <small className="text-muted">
                            ({(file.fileSize / (1024 * 1024)).toFixed(2)} MB)
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Updating Course...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Update Course
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCourse;
