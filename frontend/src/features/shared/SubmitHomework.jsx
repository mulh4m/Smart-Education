import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitHomework,
  updateSubmission,
  selectCoursesLoading,
  selectCoursesError,
  selectCoursesSuccess,
  clearSuccessMessage,
  clearError,
} from "../../store/slices/courseSlice";
import { selectToken } from "../../store/slices/authSlice";

const SubmitHomework = ({ courseId, existingSubmission, onSuccess, onClose }) => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const isLoading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);
  const successMessage = useSelector(selectCoursesSuccess);

  const [fileInputs, setFileInputs] = useState([{ id: 1, file: null }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (successMessage) {
      // Reset form on success
      setFileInputs([{ id: 1, file: null }]);
      setErrors({});

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        dispatch(clearSuccessMessage());
        if (onClose) {
          onClose();
        }
      }, 2000);
    }
  }, [successMessage, dispatch, onSuccess, onClose]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    const hasFiles = fileInputs.some((input) => input.file !== null);
    if (!hasFiles) {
      newErrors.files = "Please select at least one file to upload";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      // Append all selected files from all inputs
      fileInputs.forEach((input) => {
        if (input.file) {
          data.append("content", input.file);
        }
      });

      if (existingSubmission) {
        // Update existing submission
        dispatch(
          updateSubmission({
            courseId,
            submissionId: existingSubmission._id,
            formData: data,
            token,
          })
        );
      } else {
        // Create new submission
        dispatch(submitHomework({ courseId, formData: data, token }));
      }
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-upload me-2 text-primary"></i>
              {existingSubmission ? "Update Submission" : "Submit Homework/Activity"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isLoading}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
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

              {existingSubmission && existingSubmission.status === "graded" && (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  This submission has already been graded. You cannot update it.
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Upload Files <span className="text-danger">*</span>
                </label>
                {fileInputs.map((input, index) => (
                  <div key={input.id} className="mb-3">
                    <div className="d-flex gap-2 align-items-end">
                      <div className="flex-grow-1">
                        <input
                          type="file"
                          className={`form-control ${
                            errors.files && index === 0 ? "is-invalid" : ""
                          }`}
                          id={`file-${input.id}`}
                          onChange={(e) => handleFileChange(input.id, e)}
                          disabled={existingSubmission?.status === "graded"}
                        />
                        {errors.files && index === 0 && (
                          <div className="invalid-feedback">
                            {errors.files}
                          </div>
                        )}
                        {input.file && (
                          <small className="text-muted d-block mt-1">
                            Selected: {input.file.name} (
                            {(input.file.size / (1024 * 1024)).toFixed(2)} MB)
                          </small>
                        )}
                      </div>
                      {fileInputs.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => removeFileInput(input.id)}
                          disabled={existingSubmission?.status === "graded"}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {existingSubmission?.status !== "graded" && (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={addFileInput}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Add Another File
                  </button>
                )}
              </div>

              {existingSubmission && (
                <div className="alert alert-info">
                  <strong>Current Status:</strong>{" "}
                  <span className="badge bg-primary">{existingSubmission.status}</span>
                  {existingSubmission.grade !== undefined && (
                    <>
                      <br />
                      <strong>Grade:</strong> {existingSubmission.grade}/100
                    </>
                  )}
                  {existingSubmission.feedback && (
                    <>
                      <br />
                      <strong>Feedback:</strong> {existingSubmission.feedback}
                    </>
                  )}
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
                Cancel
              </button>
              {existingSubmission?.status !== "graded" && (
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
                      {existingSubmission ? "Updating..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-2"></i>
                      {existingSubmission ? "Update Submission" : "Submit"}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitHomework;

