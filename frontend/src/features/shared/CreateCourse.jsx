import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCourse,
  selectCoursesLoading,
  selectCoursesError,
  selectCoursesSuccess,
  clearSuccessMessage,
  clearError,
} from "../../store/slices/courseSlice";
import { selectToken } from "../../store/slices/authSlice";

const CreateCourse = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const isLoading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);
  const successMessage = useSelector(selectCoursesSuccess);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
  });

  const [contentSections, setContentSections] = useState([
    {
      id: 1,
      contentType: "video",
      title: "",
      description: "",
      files: [{ id: 1, file: null }],
    },
  ]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (successMessage) {
      // Reset form on success
      setFormData({
        title: "",
        description: "",
        subject: "",
      });
      setContentSections([
        {
          id: 1,
          contentType: "video",
          title: "",
          description: "",
          files: [{ id: 1, file: null }],
        },
      ]);
      setErrors({});

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

      const hasFiles = section.files.some((file) => file.file !== null);
      if (!hasFiles) {
        newErrors[`section_${index}_files`] = "Please select at least one file for this section";
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
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );
    
    // Clear error for this field
    const errorKey = `section_${contentSections.findIndex(s => s.id === sectionId)}_${field}`;
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
          section.id === sectionId
            ? {
                ...section,
                files: section.files.map((fileInput) =>
                  fileInput.id === fileId ? { ...fileInput, file } : fileInput
                ),
              }
            : section
        )
      );
      
      // Clear error for this section's files
      const sectionIndex = contentSections.findIndex(s => s.id === sectionId);
      const errorKey = `section_${sectionIndex}_files`;
      if (errors[errorKey]) {
        setErrors((prev) => ({
          ...prev,
          [errorKey]: "",
        }));
      }
    }
  };

  const addFileInput = (sectionId) => {
    setContentSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              files: [
                ...section.files,
                {
                  id: Math.max(...section.files.map((f) => f.id), 0) + 1,
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
        section.id === sectionId && section.files.length > 1
          ? {
              ...section,
              files: section.files.filter((file) => file.id !== fileId),
            }
          : section
      )
    );
  };

  const addContentSection = () => {
    const newId = Math.max(...contentSections.map((s) => s.id), 0) + 1;
    setContentSections((prev) => [
      ...prev,
      {
        id: newId,
        contentType: "video",
        title: "",
        description: "",
        files: [{ id: 1, file: null }],
      },
    ]);
  };

  const removeContentSection = (sectionId) => {
    if (contentSections.length > 1) {
      setContentSections((prev) => prev.filter((section) => section.id !== sectionId));
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
      const sectionsData = contentSections.map((section) => ({
        contentType: section.contentType,
        title: section.title,
        description: section.description,
        fileCount: section.files.filter((f) => f.file !== null).length,
      }));

      data.append("contentSections", JSON.stringify(sectionsData));

      // Append all selected files from all sections
      contentSections.forEach((section) => {
        section.files.forEach((fileInput) => {
          if (fileInput.file) {
            data.append("content", fileInput.file);
          }
        });
      });

      dispatch(createCourse({ formData: data, token }));
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

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold">
            <i className="bi bi-plus-circle-fill text-primary me-2"></i>
            Create New Course
          </h2>
          <p className="text-muted">Add educational content for students</p>
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

      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
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
                      <div key={section.id} className="card mb-3 border-primary">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                          <h6 className="mb-0 fw-semibold">
                            Section {sectionIndex + 1}
                          </h6>
                          {contentSections.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeContentSection(section.id)}
                              title="Remove this section"
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
                                    section.id,
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
                                    section.id,
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
                                    section.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter section description (optional)"
                              ></textarea>
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-semibold">
                                {getFileTypeLabel(section.contentType)}{" "}
                                <span className="text-danger">*</span>
                              </label>
                              {section.files.map((fileInput, fileIndex) => (
                                <div key={fileInput.id} className="mb-3">
                                  <div className="d-flex gap-2 align-items-end">
                                    <div className="flex-grow-1">
                                      <input
                                        type="file"
                                        className={`form-control ${
                                          errors[`section_${sectionIndex}_files`] && fileIndex === 0
                                            ? "is-invalid"
                                            : ""
                                        }`}
                                        onChange={(e) =>
                                          handleFileChange(section.id, fileInput.id, e)
                                        }
                                        accept={getAcceptedFileTypes(section.contentType)}
                                      />
                                      {errors[`section_${sectionIndex}_files`] && fileIndex === 0 && (
                                        <div className="invalid-feedback">
                                          {errors[`section_${sectionIndex}_files`]}
                                        </div>
                                      )}
                                      {fileInput.file && (
                                        <small className="text-muted d-block mt-1">
                                          Selected: {fileInput.file.name} (
                                          {(fileInput.file.size / (1024 * 1024)).toFixed(2)} MB)
                                        </small>
                                      )}
                                    </div>
                                    {section.files.length > 1 && (
                                      <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() =>
                                          removeFileInput(section.id, fileInput.id)
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
                                onClick={() => addFileInput(section.id)}
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

                <div className="d-grid gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Creating Course...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-upload me-2"></i>
                        Create Course
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
