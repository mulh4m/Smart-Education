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
  });

  // Initialize content sections from course data
  const [contentSections, setContentSections] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        subject: course.subject || "",
      });

      // Initialize sections from existing course
      if (course.contentSections && course.contentSections.length > 0) {
        const sections = course.contentSections.map((section) => ({
          _id: section._id ? section._id.toString() : undefined,
          contentType: section.contentType || "video",
          title: section.title || "",
          description: section.description || "",
          existingFiles: section.files || [],
          newFiles: [{ id: 1, file: null }],
        }));
        setContentSections(sections);
      } else {
        // If no sections exist, create one empty section
        setContentSections([
          {
            _id: `new-${Date.now()}`,
            contentType: "video",
            title: "",
            description: "",
            existingFiles: [],
            newFiles: [{ id: 1, file: null }],
          },
        ]);
      }
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

    // Validate content sections
    contentSections.forEach((section, index) => {
      if (!section.title.trim()) {
        newErrors[`section_${index}_title`] = "Section title is required";
      }
    });

    if (contentSections.length === 0) {
      newErrors.sections = "Please add at least one content section";
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
  };

  const handleSectionChange = (sectionId, field, value) => {
    setContentSections((prev) =>
      prev.map((section) =>
        section._id === sectionId ? { ...section, [field]: value } : section
      )
    );
    
    // Clear error for this field
    const sectionIndex = contentSections.findIndex(s => s._id === sectionId);
    const errorKey = `section_${sectionIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  const handleFileChange = (sectionId, fileId, e) => {
    const file = e.target.files[0];
    if (file) {
      setContentSections((prev) =>
        prev.map((section) =>
          section._id === sectionId
            ? {
                ...section,
                newFiles: section.newFiles.map((fileInput) =>
                  fileInput.id === fileId ? { ...fileInput, file } : fileInput
                ),
              }
            : section
        )
      );
    }
  };

  const addFileInput = (sectionId) => {
    setContentSections((prev) =>
      prev.map((section) =>
        section._id === sectionId
          ? {
              ...section,
              newFiles: [
                ...section.newFiles,
                {
                  id: Math.max(...section.newFiles.map((f) => f.id), 0) + 1,
                  file: null,
                },
              ],
            }
          : section
      )
    );
  };

  const removeFileInput = (sectionId, fileId) => {
    setContentSections((prev) =>
      prev.map((section) =>
        section._id === sectionId && section.newFiles.length > 1
          ? {
              ...section,
              newFiles: section.newFiles.filter((file) => file.id !== fileId),
            }
          : section
      )
    );
  };

  const addContentSection = () => {
    const newId = `new-${Date.now()}`;
    setContentSections((prev) => [
      ...prev,
      {
        _id: newId,
        contentType: "video",
        title: "",
        description: "",
        existingFiles: [],
        newFiles: [{ id: 1, file: null }],
      },
    ]);
  };

  const removeContentSection = (sectionId) => {
    if (contentSections.length > 1) {
      setContentSections((prev) => prev.filter((section) => section._id !== sectionId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("subject", formData.subject);

      // Prepare content sections data
      const sectionsData = contentSections.map((section) => {
        const sectionData = {
          contentType: section.contentType,
          title: section.title,
          description: section.description,
          newFileCount: section.newFiles.filter((f) => f.file !== null).length,
          hasNewFiles: section.newFiles.some((f) => f.file !== null),
        };
        
        // Only include _id for existing sections (not new ones)
        if (section._id && !section._id.toString().startsWith('new-') && !section._id.toString().startsWith('existing-')) {
          sectionData._id = section._id;
        }
        
        return sectionData;
      });

      data.append("contentSections", JSON.stringify(sectionsData));

      // Append all selected files from all sections
      contentSections.forEach((section) => {
        section.newFiles.forEach((fileInput) => {
          if (fileInput.file) {
            data.append("content", fileInput.file);
          }
        });
      });

      dispatch(updateCourse({ id: course._id, formData: data, token }));
    }
  };

  const getAcceptedFileTypes = (contentType) => {
    switch (contentType) {
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

  const getFileTypeLabel = (contentType) => {
    switch (contentType) {
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
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
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

                <div className="col-12 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="form-label fw-semibold mb-0">
                      Content Sections <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm"
                      onClick={addContentSection}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Add Section
                    </button>
                  </div>
                  
                  {errors.sections && (
                    <div className="alert alert-danger">{errors.sections}</div>
                  )}

                  {contentSections.map((section, sectionIndex) => (
                    <div key={section._id} className="card mb-3 border-primary">
                      <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-semibold">
                          Section {sectionIndex + 1}
                        </h6>
                        {contentSections.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeContentSection(section._id)}
                            title="Delete this section"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-semibold">
                              Content Type <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-select"
                              value={section.contentType}
                              onChange={(e) =>
                                handleSectionChange(
                                  section._id,
                                  "contentType",
                                  e.target.value
                                )
                              }
                            >
                              <option value="video">Video</option>
                              <option value="material">Material</option>
                              <option value="homework">Homework</option>
                              <option value="activity">Activity</option>
                            </select>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-semibold">
                              Section Title <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${
                                errors[`section_${sectionIndex}_title`] ? "is-invalid" : ""
                              }`}
                              value={section.title}
                              onChange={(e) =>
                                handleSectionChange(
                                  section._id,
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder="Enter section title"
                            />
                            {errors[`section_${sectionIndex}_title`] && (
                              <div className="invalid-feedback">
                                {errors[`section_${sectionIndex}_title`]}
                              </div>
                            )}
                          </div>
                          <div className="col-12 mb-3">
                            <label className="form-label fw-semibold">
                              Section Description
                            </label>
                            <textarea
                              className="form-control"
                              rows="2"
                              value={section.description}
                              onChange={(e) =>
                                handleSectionChange(
                                  section._id,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Enter section description (optional)"
                            ></textarea>
                          </div>

                          {/* Existing Files */}
                          {section.existingFiles && section.existingFiles.length > 0 && (
                            <div className="col-12 mb-3">
                              <label className="form-label fw-semibold">
                                Existing Files:
                              </label>
                              <div className="border rounded p-3 bg-light">
                                {section.existingFiles.map((file, fileIndex) => (
                                  <div key={fileIndex} className="d-flex align-items-center mb-2">
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

                          {/* New Files Input */}
                          <div className="col-12">
                            <label className="form-label fw-semibold">
                              {getFileTypeLabel(section.contentType)}{" "}
                              <span className="text-muted">(Optional - leave empty to keep existing files)</span>
                            </label>
                            {section.newFiles.map((fileInput, fileIndex) => (
                              <div key={fileInput.id} className="mb-3">
                                <div className="d-flex gap-2 align-items-end">
                                  <div className="flex-grow-1">
                                    <input
                                      type="file"
                                      className="form-control"
                                      onChange={(e) =>
                                        handleFileChange(section._id, fileInput.id, e)
                                      }
                                      accept={getAcceptedFileTypes(section.contentType)}
                                    />
                                    {fileInput.file && (
                                      <small className="text-muted d-block mt-1">
                                        Selected: {fileInput.file.name} (
                                        {(fileInput.file.size / (1024 * 1024)).toFixed(2)} MB)
                                      </small>
                                    )}
                                  </div>
                                  {section.newFiles.length > 1 && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() =>
                                        removeFileInput(section._id, fileInput.id)
                                      }
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
                              onClick={() => addFileInput(section._id)}
                            >
                              <i className="bi bi-plus-circle me-1"></i>
                              Add Another File
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
