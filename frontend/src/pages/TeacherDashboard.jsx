import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectUser, selectToken } from "../store/slices/authSlice";
import { getCourseStats, selectCourseStats } from "../store/slices/courseSlice";
import CreateCourse from "../features/shared/CreateCourse";
import CourseList from "../features/shared/CourseList";

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const stats = useSelector(selectCourseStats);
  const dispatch = useDispatch();

  const [activeView, setActiveView] = useState("dashboard");

  useEffect(() => {
    if (token) {
      dispatch(getCourseStats(token));
    }
  }, [dispatch, token]);

  const renderContent = () => {
    switch (activeView) {
      case "courses":
        return (
          <CourseList onCreateCourse={() => setActiveView("createCourse")} />
        );
      case "createCourse":
        return <CreateCourse onSuccess={() => setActiveView("courses")} />;
      default:
        return (
          <div>
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3 text-primary">
                <i className="bi bi-person-badge-fill text-info me-3"></i>
                {t("pages.teacherDashboard.title")}
              </h1>
              <p className="lead text-muted mb-4">
                {t("pages.teacherDashboard.welcome", { name: user?.fullName })}
              </p>
              <div className="alert alert-info border-0 rounded-3 mb-4">
                <div className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-mortarboard me-3 fs-4"></i>
                  <div>
                    <h5 className="mb-1 fw-bold">
                      {t("pages.teacherDashboard.teacherPortal")}
                    </h5>
                    <p className="mb-0 small">
                      {t("pages.teacherDashboard.teacherDescription")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="row g-4 mb-5">
              <div className="col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p className="text-muted mb-1">
                          {t("pages.teacherDashboard.stats.totalCourses")}
                        </p>
                        <h2 className="fw-bold mb-0">
                          {stats?.totalCourses || 0}
                        </h2>
                      </div>
                      <div className="bg-primary bg-opacity-10 p-3 rounded">
                        <i className="bi bi-collection-fill text-primary fs-3"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p className="text-muted mb-1">
                          {t("pages.teacherDashboard.stats.videoLessons")}
                        </p>
                        <h2 className="fw-bold mb-0">
                          {stats?.byContentType?.video || 0}
                        </h2>
                      </div>
                      <div className="bg-danger bg-opacity-10 p-3 rounded">
                        <i className="bi bi-play-circle-fill text-danger fs-3"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p className="text-muted mb-1">
                          {t("pages.teacherDashboard.stats.assignments")}
                        </p>
                        <h2 className="fw-bold mb-0">
                          {stats?.byContentType?.homework || 0}
                        </h2>
                      </div>
                      <div className="bg-success bg-opacity-10 p-3 rounded">
                        <i className="bi bi-clipboard-check-fill text-success fs-3"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-lg-6 col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <i
                        className="bi bi-collection-fill text-primary"
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>
                    <h4 className="card-title fw-bold mb-3 text-primary">
                      {t("pages.teacherDashboard.actions.myCourses.title")}
                    </h4>
                    <p className="card-text text-muted mb-4">
                      {t(
                        "pages.teacherDashboard.actions.myCourses.description"
                      )}
                    </p>
                    <button
                      className="btn btn-primary px-4 py-2 rounded-3 fw-semibold"
                      onClick={() => setActiveView("courses")}
                    >
                      <i className="bi bi-eye-fill me-2"></i>
                      {t("pages.teacherDashboard.actions.myCourses.button")}
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <i
                        className="bi bi-plus-circle-fill text-success"
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>
                    <h4 className="card-title fw-bold mb-3 text-primary">
                      {t("pages.teacherDashboard.actions.createCourse.title")}
                    </h4>
                    <p className="card-text text-muted mb-4">
                      {t(
                        "pages.teacherDashboard.actions.createCourse.description"
                      )}
                    </p>
                    <button
                      className="btn btn-success px-4 py-2 rounded-3 fw-semibold"
                      onClick={() => setActiveView("createCourse")}
                    >
                      <i className="bi bi-plus-circle-fill me-2"></i>
                      {t("pages.teacherDashboard.actions.createCourse.button")}
                    </button>
                  </div>
                </div>
              </div>

              {/* <div className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <i
                        className="bi bi-graph-up text-warning"
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>
                    <h4 className="card-title fw-bold mb-3 text-primary">
                      {t("pages.teacherDashboard.actions.statistics.title")}
                    </h4>
                    <p className="card-text text-muted mb-4">
                      {t(
                        "pages.teacherDashboard.actions.statistics.description"
                      )}
                    </p>
                    <button className="btn btn-warning px-4 py-2 rounded-3 fw-semibold">
                      <i className="bi bi-bar-chart-fill me-2"></i>
                      {t("pages.teacherDashboard.actions.statistics.button")}
                    </button>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-vh-100 bg-gradient-light d-flex align-items-center">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12">
            {activeView !== "dashboard" && (
              <button
                className="btn btn-outline-primary mb-3"
                onClick={() => setActiveView("dashboard")}
              >
                <i className="bi bi-arrow-left me-2"></i>
                {t("pages.teacherDashboard.backToDashboard")}
              </button>
            )}

            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">{renderContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
