import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as yup from "yup";

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
});

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      // Validate email
      await forgotPasswordSchema.validate({ email }, { abortEarly: false });

      // Call backend endpoint
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Use server message when available, otherwise fallback to translation
        setSuccessMessage(
          data.message || t("pages.forgotPassword.successMessage")
        );
        setEmail("");
      } else {
        // Try to display meaningful error
        const serverMsg =
          data.message ||
          (Array.isArray(data.errors) ? data.errors.join(", ") : null);
        setError(serverMsg || "An error occurred. Please try again.");
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        setError(err.errors[0]);
      } else {
        setError("An error occurred. Please try again.");
        console.error("Forgot password error:", err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-page min-vh-100 d-flex align-items-center bg-gradient-primary">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i
                      className="bi bi-lock-fill text-primary"
                      style={{ fontSize: "3rem" }}
                    ></i>
                  </div>
                  <h2 className="fw-bold text-primary">
                    {t("pages.forgotPassword.title")}
                  </h2>
                  <p className="text-muted">
                    {t("pages.forgotPassword.subtitle")}
                  </p>
                </div>

                {successMessage && (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {successMessage}
                  </div>
                )}

                {!successMessage && (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="email" className="form-label fw-semibold">
                        {t("pages.forgotPassword.emailLabel")}
                      </label>
                      <input
                        type="email"
                        className={`form-control ${error ? "is-invalid" : ""}`}
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        placeholder={t("pages.forgotPassword.emailPlaceholder")}
                      />
                      {error && <div className="invalid-feedback">{error}</div>}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 fw-semibold mb-3"
                      disabled={isSubmitting}
                      style={{ border: "none" }}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          {t("pages.forgotPassword.sending")}
                        </>
                      ) : (
                        t("pages.forgotPassword.resetButton")
                      )}
                    </button>
                  </form>
                )}

                <div className="text-center mt-4">
                  <Link
                    to="/login"
                    className="text-decoration-none"
                    style={{ color: "#667eea" }}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    {t("pages.forgotPassword.backToSignIn")}
                  </Link>
                </div>

                <div className="text-center mt-3">
                  <Link
                    to="/"
                    className="text-muted text-decoration-none small"
                  >
                    {t("pages.forgotPassword.backToHome")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
