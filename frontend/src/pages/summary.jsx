// frontend/src/pages/summary.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectUserRole } from "../store/slices/authSlice";

const SUMMARY_API_URL = "http://localhost:5000/api/summarize";

const Summary = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userRole = useSelector(selectUserRole);

  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const handleSummarize = async () => {
    setError("");
    setCopyStatus("");
    setSummary("");

    if (!inputText.trim()) {
      setError("Please enter some text to summarize.");
      return;
    }

    try {
      setIsSummarizing(true);

      const formData = new FormData();
      formData.append("mode", "text");
      formData.append("text", inputText);

      const response = await fetch(SUMMARY_API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary.");
      }

      setSummary(data.summary || "");
    } catch (err) {
      setError(err.message || "Something went wrong while summarizing.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("Failed to copy");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  };

  const handleBackToDashboard = () => {
    switch (userRole) {
      case "admin":
        navigate("/admin-dashboard");
        break;
      case "teacher":
        navigate("/teacher-dashboard");
        break;
      case "student":
        navigate("/student-dashboard");
        break;
      default:
        navigate("/dashboard");
    }
  };

  return (
    <div className="min-vh-100 bg-gradient-light d-flex align-items-center">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12">

            {/* Back Button */}
            <div className="mb-4">
              <button
                onClick={handleBackToDashboard}
                className="btn btn-outline-primary"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Dashboard
              </button>
            </div>

            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">

                {/* Header */}
                <div className="text-center mb-5">
                  <h1 className="display-5 fw-bold mb-3 text-primary">
                    <i className="bi bi-file-earmark-richtext-fill me-3 text-info"></i>
                    Smart Summary
                  </h1>
                  <p className="lead text-muted">
                    Paste your text and let the offline Llama 3 model summarize it.
                  </p>
                </div>

                <div className="row g-4">
                  {/* Left Side Input */}
                  <div className="col-lg-6">

                    <h5 className="fw-semibold text-dark mb-3">Text Input</h5>

                    {/* Text box */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Enter text to summarize</label>
                      <textarea
                        className="form-control"
                        rows={10}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste or type your content here..."
                        style={{ resize: "vertical", minHeight: "220px" }}
                      ></textarea>

                      <div className="form-text">
                        You can paste long articles, homework, or study material.
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="alert alert-danger rounded-3 mb-3">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                      </div>
                    )}

                    {/* Summarize Button */}
                    <button
                      className="btn btn-primary w-100 py-2 fw-semibold"
                      onClick={handleSummarize}
                      disabled={isSummarizing || !inputText.trim()}
                    >
                      {isSummarizing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Summarizing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-stars me-2"></i> Summarize
                        </>
                      )}
                    </button>

                  </div>

                  {/* Right Side Output */}
                  <div className="col-lg-6">
                    <div className="d-flex justify-content-between mb-2">
                      <h5 className="fw-semibold">Summary Output</h5>

                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={handleCopy}
                        disabled={!summary}
                      >
                        <i className="bi bi-clipboard me-1"></i> Copy
                      </button>
                    </div>

                    <div
                      className="bg-light border rounded-3 p-3"
                      style={{
                        minHeight: "260px",
                        maxHeight: "420px",
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.6,
                      }}
                    >
                      {isSummarizing ? (
                        <div className="text-muted">
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Generating summary...
                        </div>
                      ) : summary ? (
                        <div>{summary}</div>
                      ) : (
                        <div className="text-muted">
                          Your summary will appear here.
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
