// frontend/src/pages/summary.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectUserRole } from "../store/slices/authSlice";

// Backend URL – your server runs on port 5000
const SUMMARY_API_URL = "http://localhost:5000/api/summarize";

const Summary = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userRole = useSelector(selectUserRole);

  const [activeInput, setActiveInput] = useState("text"); // "text" | "pdf"
  const [inputText, setInputText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const handleInputTabChange = (tabId) => {
    setActiveInput(tabId);
    setError("");
    // Optional: clear the other input when switching
    // if (tabId === "text") setPdfFile(null);
    // if (tabId === "pdf") setInputText("");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setPdfFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      setPdfFile(null);
      return;
    }

    setError("");
    setPdfFile(file);
  };

  const handleSummarize = async () => {
    setError("");
    setCopyStatus("");
    setSummary("");

    if (activeInput === "text" && !inputText.trim()) {
      setError("Please enter some text to summarize.");
      return;
    }

    if (activeInput === "pdf" && !pdfFile) {
      setError("Please upload a PDF file to summarize.");
      return;
    }

    try {
      setIsSummarizing(true);

      const formData = new FormData();
      formData.append("mode", activeInput);

      if (activeInput === "text") {
        formData.append("text", inputText);
      } else if (activeInput === "pdf" && pdfFile) {
        formData.append("file", pdfFile);
      }

      const response = await fetch(SUMMARY_API_URL, {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary.");
      }

      if (!data.summary) {
        throw new Error("No summary returned from the server.");
      }

      setSummary(data.summary);
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      setCopyStatus("Failed to copy");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  };

  const isSummarizeDisabled =
    isSummarizing ||
    (activeInput === "text" ? !inputText.trim() : !pdfFile);

  const inputTabs = [
    {
      id: "text",
      label: t("pages.summary.inputTabs.text", "Text input"),
      icon: "bi-type",
    },
    {
      id: "pdf",
      label: t("pages.summary.inputTabs.pdf", "PDF upload"),
      icon: "bi-file-earmark-pdf-fill",
    },
  ];

  const handleBackToDashboard = () => {
    switch(userRole) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'teacher':
        navigate('/teacher/dashboard');
        break;
      case 'student':
        navigate('/student/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-vh-100 bg-gradient-light d-flex align-items-center">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12">
            {/* Back to Dashboard Button */}
            <div className="mb-4">
              <button
                onClick={handleBackToDashboard}
                className="btn btn-outline-primary"
              >
                <i className="bi bi-arrow-left me-2"></i>
                {t("pages.summary.backToDashboard", "Back to Dashboard")}
              </button>
            </div>

            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                {/* Page Header */}
                <div className="text-center mb-5">
                  <h1 className="display-5 fw-bold mb-3 text-primary">
                    <i className="bi bi-file-earmark-richtext-fill me-3 text-info"></i>
                    {t("pages.summary.title", "Smart Summary")}
                  </h1>
                  <p className="lead text-muted mb-0">
                    {t(
                      "pages.summary.subtitle",
                      "Paste text or upload a PDF and let the offline Llama 3 model create a clear summary for you."
                    )}
                  </p>
                </div>

                <div className="row g-4">
                  {/* Left: Inputs */}
                  <div className="col-lg-6">
                    <div className="mb-3">
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
                        <h5 className="mb-0 fw-semibold text-dark">
                          {t(
                            "pages.summary.inputTitle",
                            "Choose input type"
                          )}
                        </h5>
                        <span className="badge bg-primary text-white px-3 py-2" style={{ fontSize: "0.85rem" }}>
                          <i className="bi bi-cpu-fill me-1"></i>
                          {t(
                            "pages.summary.offlineBadge",
                            "Offline Llama 3"
                          )}
                        </span>
                      </div>

                      <ul className="nav nav-tabs nav-justified" role="tablist">
                        {inputTabs.map((tab) => (
                          <li
                            key={tab.id}
                            className="nav-item"
                            role="presentation"
                          >
                            <button
                              type="button"
                              className={`nav-link ${
                                activeInput === tab.id ? "active" : ""
                              }`}
                              onClick={() => handleInputTabChange(tab.id)}
                              role="tab"
                              style={{
                                border: "none",
                                borderBottom:
                                  activeInput === tab.id
                                    ? "3px solid"
                                    : "3px solid transparent",
                                borderBottomColor:
                                  activeInput === tab.id
                                    ? "#667eea"
                                    : "transparent",
                                color:
                                  activeInput === tab.id
                                    ? "#667eea"
                                    : "#6c757d",
                                fontWeight:
                                  activeInput === tab.id ? "600" : "400",
                                padding: "1rem",
                                transition: "all 0.3s ease",
                              }}
                            >
                              <i className={`bi ${tab.icon} me-2`}></i>
                              {tab.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Text input */}
                    {activeInput === "text" && (
                      <div className="mb-4">
                        <label className="form-label fw-semibold">
                          {t(
                            "pages.summary.textLabel",
                            "Enter text to summarize"
                          )}
                        </label>
                        <textarea
                          className="form-control"
                          rows={10}
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder={t(
                            "pages.summary.textPlaceholder",
                            "Paste or type your content here..."
                          )}
                          style={{
                            resize: "vertical",
                            minHeight: "220px",
                          }}
                        ></textarea>
                        <div className="form-text">
                          {t(
                            "pages.summary.textHint",
                            "You can paste long articles, homework, or any study material."
                          )}
                        </div>
                      </div>
                    )}

                    {/* PDF input */}
                    {activeInput === "pdf" && (
                      <div className="mb-4">
                        <label className="form-label fw-semibold">
                          {t(
                            "pages.summary.pdfLabel",
                            "Upload a PDF to summarize"
                          )}
                        </label>
                        <div className="border rounded-3 p-3 bg-light d-flex align-items-center justify-content-between">
                          <div>
                            <p className="mb-1 fw-semibold">
                              <i className="bi bi-file-earmark-pdf-fill text-danger me-2"></i>
                              {pdfFile
                                ? pdfFile.name
                                : t(
                                    "pages.summary.pdfPlaceholder",
                                    "No file selected"
                                  )}
                            </p>
                            <small className="text-muted">
                              {t(
                                "pages.summary.pdfHint",
                                "Text-based PDFs work best. Scanned image-only PDFs may not extract correctly."
                              )}
                            </small>
                          </div>
                          <div>
                            <label className="btn btn-outline-primary mb-0">
                              <i className="bi bi-upload me-2"></i>
                              {t(
                                "pages.summary.pdfButton",
                                "Choose PDF"
                              )}
                              <input
                                type="file"
                                accept="application/pdf"
                                hidden
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error message */}
                    {error && (
                      <div className="alert alert-danger border-0 rounded-3 mb-3">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                      </div>
                    )}

                    {/* Summarize button */}
                    <button
                      type="button"
                      className="btn btn-primary w-100 py-2 fw-semibold"
                      onClick={handleSummarize}
                      disabled={isSummarizeDisabled}
                      style={{ border: "none" }}
                    >
                      {isSummarizing ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          {t(
                            "pages.summary.summarizing",
                            "Summarizing..."
                          )}
                        </>
                      ) : (
                        <>
                          <i className="bi bi-stars me-2"></i>
                          {t(
                            "pages.summary.summarizeButton",
                            "Summarize"
                          )}
                        </>
                      )}
                    </button>

                    <div className="mt-2 small text-muted">
                      {t(
                        "pages.summary.privacyNote",
                        "Your text/PDF is processed on your own server using the offline Llama 3 model."
                      )}
                    </div>
                  </div>

                  {/* Right: Output */}
                  <div className="col-lg-6">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="mb-0 fw-semibold">
                        {t(
                          "pages.summary.outputTitle",
                          "Summary output"
                        )}
                      </h5>
                      <div className="d-flex align-items-center gap-2">
                        {copyStatus && (
                          <small className="text-success">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            {copyStatus}
                          </small>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={handleCopy}
                          disabled={!summary}
                        >
                          <i className="bi bi-clipboard me-1"></i>
                          {t(
                            "pages.summary.copyButton",
                            "Copy"
                          )}
                        </button>
                      </div>
                    </div>

                    <div
                      className="bg-light border rounded-3 p-3"
                      style={{
                        minHeight: "260px",
                        maxHeight: "420px",
                        overflowY: "auto",
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {isSummarizing && !summary && (
                        <div className="d-flex align-items-center text-muted">
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          {t(
                            "pages.summary.generating",
                            "Generating summary with Llama 3..."
                          )}
                        </div>
                      )}

                      {!isSummarizing && !summary && (
                        <div className="text-muted">
                          {t(
                            "pages.summary.outputPlaceholder",
                            "Your summary will appear here. It will be formatted for easy reading, even for long texts."
                          )}
                        </div>
                      )}

                      {summary && <div>{summary}</div>}
                    </div>

                    <div className="mt-2 small text-muted">
                      {t(
                        "pages.summary.scrollHint",
                        "Use the scroll bar to read long summaries comfortably."
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
