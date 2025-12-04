import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  getCourses,
  selectCourses,
  selectCoursesLoading,
} from "../store/slices/courseSlice";
import { selectToken, selectIsAuthenticated } from "../store/slices/authSlice";
import { useTranslation } from "react-i18next";

const CourseShowcase = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const courses = useSelector(selectCourses);
  const isLoading = useSelector(selectCoursesLoading);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [displayedCourses, setDisplayedCourses] = useState([]);

  useEffect(() => {
    if (token) {
      dispatch(getCourses({ filters: {}, token }));
    }
  }, [dispatch, token]);

  useEffect(() => {
    // Show only first 6 courses for showcase
    setDisplayedCourses(courses.slice(0, 6));
  }, [courses]);

  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case "video":
        return <i className="bi bi-play-circle-fill text-danger"></i>;
      case "material":
        return <i className="bi bi-file-earmark-text-fill text-primary"></i>;
      case "homework":
        return <i className="bi bi-clipboard-check-fill text-success"></i>;
      default:
        return <i className="bi bi-file-earmark"></i>;
    }
  };

  const getContentTypeBadge = (contentType) => {
    switch (contentType) {
      case "video":
        return (
          <span className="badge bg-danger">{t("courseShowcase.video")}</span>
        );
      case "material":
        return (
          <span className="badge bg-primary">
            {t("courseShowcase.material")}
          </span>
        );
      case "homework":
        return (
          <span className="badge bg-success">
            {t("courseShowcase.homework")}
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary">
            {t("courseShowcase.contentType")}
          </span>
        );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return t("courseShowcase.zeroBytes");
    const k = 1024;
    const sizes = [
      t("courseShowcase.bytes"),
      t("courseShowcase.kb"),
      t("courseShowcase.mb"),
      t("courseShowcase.gb"),
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleCourseClick = (courseId) => {
    if (isAuthenticated) {
      navigate(`/course/${courseId}`);
    } else {
      navigate(t("courseShowcase.login"));
    }
  };

  const handleViewAllCourses = () => {
    navigate("/courses");
  };

  return (
    <section
      className="py-5"
      style={{
        background: "var(--bg-gradient)",
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <div className="mb-3">
            <span className="badge bg-primary px-4 py-2 rounded-pill fs-6">
              <i className="bi bi-star-fill me-2"></i>
              {t("courseShowcase.badge")}
            </span>
          </div>
          <h2 className="display-5 fw-bold mb-3 text-primary">
            {t("courseShowcase.title")}
          </h2>
          <p
            className="lead text-muted mb-4"
            style={{ maxWidth: "600px", margin: "0 auto" }}
          >
            {t("courseShowcase.description")}
          </p>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">
                {t("courseShowcase.loading.loading")}
              </span>
            </div>
            <p className="text-muted mt-3">
              {t("courseShowcase.loading.loading")}
            </p>
          </div>
        ) : displayedCourses.length > 0 ? (
          <>
            <div className="row g-4 mb-5">
              {displayedCourses.map((course) => (
                <div key={course._id} className="col-lg-4 col-md-6">
                  <div
                    className="card h-100 border-0 shadow-sm course-card"
                    style={{
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      background: "white",
                    }}
                    onClick={() => handleCourseClick(course._id)}
                  >
                    <div className="card-body p-4">
                      {/* Course Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="fs-2">
                          {getContentTypeIcon(course.contentType)}
                        </div>
                        {getContentTypeBadge(course.contentType)}
                      </div>

                      {/* Course Title */}
                      <h5
                        className="card-title fw-bold mb-2"
                        style={{ color: "#2c3e50" }}
                      >
                        {course.title}
                      </h5>

                      {/* Subject */}
                      <p className="text-muted small mb-2">
                        <i className="bi bi-bookmark-fill me-1"></i>
                        {course.subject}
                      </p>

                      {/* Description */}
                      <p
                        className="card-text text-muted small mb-3"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {course.description.length > 80
                          ? `${course.description.substring(0, 80)}...`
                          : course.description}
                      </p>

                      {/* Course Meta */}
                      <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                        <span>
                          <i className="bi bi-file-earmark me-1"></i>
                          {formatFileSize(course.fileSize)}
                        </span>
                        <span>
                          <i className="bi bi-calendar me-1"></i>
                          {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Action Button */}
                      <div className="d-grid">
                        {isAuthenticated ? (
                          <button className="btn btn-primary btn-sm">
                            <i className="bi bi-eye me-1"></i>
                            {t("courseShowcase.viewCourse")}
                          </button>
                        ) : (
                          <button className="btn btn-outline-primary btn-sm">
                            <i className="bi bi-lock me-1"></i>
                            {t("courseShowcase.loginToAccess")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <button
                className="btn btn-primary btn-lg px-5 py-3"
                onClick={handleViewAllCourses}
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "50px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(102, 126, 234, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <i className="bi bi-collection me-2"></i>
                {isAuthenticated
                  ? t("courseShowcase.viewAllCourses")
                  : t("courseShowcase.getStartedFree")}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-5">
            <i
              className="bi bi-inbox text-muted mb-3"
              style={{ fontSize: "4rem" }}
            ></i>
            <h4 className="text-muted mb-3">
              {t("courseShowcase.noCoursesAvailable")}
            </h4>
            <p className="text-muted mb-4">
              {t("courseShowcase.checkBackSoon")}
            </p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-primary">
                <i className="bi bi-person-plus me-2"></i>
                {t("courseShowcase.joinNow")}
              </Link>
            )}
          </div>
        )}

        {/* Stats Section */}
        {displayedCourses.length > 0 && (
          <div
            className="row g-4 mt-5 pt-5"
            style={{ borderTop: "1px solid #dee2e6" }}
          >
            <div className="col-md-4 text-center">
              <div className="p-4">
                <i
                  className="bi bi-collection-fill text-primary mb-3"
                  style={{ fontSize: "2.5rem" }}
                ></i>
                <h3 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>
                  {courses.length}+
                </h3>
                <p className="text-muted mb-0">
                  {t("courseShowcase.totalCourses")}
                </p>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <div className="p-4">
                <i
                  className="bi bi-people-fill text-success mb-3"
                  style={{ fontSize: "2.5rem" }}
                ></i>
                <h3 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>
                  1000+
                </h3>
                <p className="text-muted mb-0">
                  {t("courseShowcase.happyStudents")}
                </p>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <div className="p-4">
                <i
                  className="bi bi-star-fill text-warning mb-3"
                  style={{ fontSize: "2.5rem" }}
                ></i>
                <h3 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>
                  4.9★
                </h3>
                <p className="text-muted mb-0">
                  {t("courseShowcase.averageRating")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .course-card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
        }

        .course-card {
          border-radius: 15px !important;
        }

        .btn:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3) !important;
        }
      `}</style>
    </section>
  );
};

export default CourseShowcase;
