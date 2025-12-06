import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getCourses,
  selectCourses,
  selectCoursesLoading,
} from "../store/slices/courseSlice";
import { selectToken, selectIsAuthenticated } from "../store/slices/authSlice";
import { useTranslation } from "react-i18next";

const AllCourses = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const courses = useSelector(selectCourses);
  const isLoading = useSelector(selectCoursesLoading);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [activeTab, setActiveTab] = useState("video");

  useEffect(() => {
    if (token) {
      dispatch(getCourses({ filters: {}, token }));
    }
  }, [dispatch, token]);

  // Filter courses by active tab (courses can have multiple content types)
  const filteredCourses = courses.filter((course) => {
    if (!course.contentSections || course.contentSections.length === 0) {
      return false;
    }
    return course.contentSections.some(
      (section) => section.contentType === activeTab
    );
  });

  const getContentTypeIcon = (contentTypes) => {
    // Show icon for the first content type, or multiple icons if there are multiple types
    if (!contentTypes || contentTypes.length === 0) {
      return <i className="bi bi-file-earmark"></i>;
    }
    
    if (contentTypes.length === 1) {
      switch (contentTypes[0]) {
        case "video":
          return <i className="bi bi-play-circle-fill text-danger"></i>;
        case "material":
          return <i className="bi bi-file-earmark-text-fill text-primary"></i>;
        case "homework":
          return <i className="bi bi-clipboard-check-fill text-success"></i>;
        case "activity":
          return <i className="bi bi-lightning-charge-fill text-warning"></i>;
        default:
          return <i className="bi bi-file-earmark"></i>;
      }
    }
    
    // Multiple content types - show a stack icon
    return <i className="bi bi-stack text-info"></i>;
  };

  const getContentTypeBadges = (contentTypes) => {
    if (!contentTypes || contentTypes.length === 0) {
      return (
        <span className="badge bg-secondary">
          {t("courseShowcase.contentType")}
        </span>
      );
    }

    return contentTypes.map((contentType, index) => {
      let badgeClass = "bg-secondary";
      let label = contentType;

      switch (contentType) {
        case "video":
          badgeClass = "bg-danger";
          label = t("courseShowcase.video");
          break;
        case "material":
          badgeClass = "bg-primary";
          label = t("courseShowcase.material");
          break;
        case "homework":
          badgeClass = "bg-success";
          label = t("courseShowcase.homework");
          break;
        case "activity":
          badgeClass = "bg-warning";
          label = t("allCourses.activity");
          break;
      }

      return (
        <span key={index} className={`badge ${badgeClass} me-1`}>
          {label}
        </span>
      );
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return t("courseShowcase.zeroBytes");
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

  const getCourseFileSize = (course) => {
    // Calculate from contentSections
    if (course.contentSections && course.contentSections.length > 0) {
      return course.contentSections.reduce((total, section) => {
        if (section.files && section.files.length > 0) {
          return total + section.files.reduce((sectionTotal, file) => sectionTotal + (file.fileSize || 0), 0);
        }
        return total;
      }, 0);
    }
    return 0;
  };

  const getCourseContentTypes = (course) => {
    if (!course.contentSections || course.contentSections.length === 0) {
      return [];
    }
    return [...new Set(course.contentSections.map(section => section.contentType))];
  };

  const handleCourseClick = (courseId) => {
    if (isAuthenticated) {
      navigate(`/course/${courseId}`);
    } else {
      navigate("/login");
    }
  };

  const tabs = [
    { id: "video", label: t("allCourses.tabs.video"), icon: "bi-play-circle-fill" },
    { id: "material", label: t("allCourses.tabs.material"), icon: "bi-file-earmark-text-fill" },
    { id: "homework", label: t("allCourses.tabs.homework"), icon: "bi-clipboard-check-fill" },
    { id: "activity", label: t("allCourses.tabs.activity"), icon: "bi-lightning-charge-fill" },
  ];

  const getTabCount = (contentType) => {
    return courses.filter((course) => {
      if (!course.contentSections || course.contentSections.length === 0) {
        return false;
      }
      return course.contentSections.some(
        (section) => section.contentType === contentType
      );
    }).length;
  };

  return (
    <div
      className="min-vh-100 py-5"
      style={{
        background: "var(--bg-gradient)",
      }}
    >
      <div className="container" style={{ marginTop: "4rem", paddingBottom: "3rem" }}>
        {/* Page Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3 text-primary">
            <i className="bi bi-collection-fill me-3"></i>
            {t("allCourses.title")}
          </h1>
          <p className="lead text-muted" style={{ maxWidth: "600px", margin: "0 auto" }}>
            {t("allCourses.description")}
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-4">
          <ul className="nav nav-tabs nav-justified" role="tablist">
            {tabs.map((tab) => (
              <li key={tab.id} className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  role="tab"
                  style={{
                    border: "none",
                    borderBottom: activeTab === tab.id ? "3px solid" : "3px solid transparent",
                    borderBottomColor: activeTab === tab.id ? "#667eea" : "transparent",
                    color: activeTab === tab.id ? "#667eea" : "#6c757d",
                    fontWeight: activeTab === tab.id ? "600" : "400",
                    padding: "1rem",
                    transition: "all 0.3s ease",
                  }}
                >
                  <i className={`bi ${tab.icon} me-2`}></i>
                  {tab.label}
                  <span className="badge bg-secondary ms-2">
                    {getTabCount(tab.id)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Courses Content */}
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
        ) : filteredCourses.length > 0 ? (
          <div className="row g-4">
            {filteredCourses.map((course) => (
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
                        {getContentTypeIcon(getCourseContentTypes(course))}
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {getContentTypeBadges(getCourseContentTypes(course))}
                      </div>
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
                        {formatFileSize(getCourseFileSize(course))}
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
        ) : (
          <div className="text-center py-5">
            <i
              className="bi bi-inbox text-muted mb-3"
              style={{ fontSize: "4rem" }}
            ></i>
            <h4 className="text-muted mb-3">
              {t("allCourses.noCourses", { type: tabs.find(t => t.id === activeTab)?.label })}
            </h4>
            <p className="text-muted mb-4">
              {t("allCourses.checkBackSoon")}
            </p>
            {!isAuthenticated && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/register")}
              >
                <i className="bi bi-person-plus me-2"></i>
                {t("courseShowcase.joinNow")}
              </button>
            )}
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

        .nav-link:hover {
          background-color: rgba(102, 126, 234, 0.05);
        }

        .nav-link.active {
          background-color: rgba(102, 126, 234, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AllCourses;

