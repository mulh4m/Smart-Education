import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import { selectUser, selectToken } from "../store/slices/authSlice";
import { getCourseStats, selectCourseStats } from "../store/slices/courseSlice";
import {
  getTeachers,
  getStudents,
  selectTeachers,
  selectStudents,
} from "../store/slices/adminSlice";
import UserManagement from "../features/admin/UserManagement";
import CreateTeacher from "../features/admin/CreateTeacher";
import CreateCourse from "../features/shared/CreateCourse";
import CourseList from "../features/shared/CourseList";
import { useTheme } from "../contexts/ThemeContext";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const stats = useSelector(selectCourseStats);
  const teachers = useSelector(selectTeachers);
  const students = useSelector(selectStudents);
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  const [activeView, setActiveView] = useState("dashboard");

  useEffect(() => {
    if (token) {
      dispatch(getCourseStats(token));
      dispatch(getTeachers(token));
      dispatch(getStudents(token));
    }
  }, [dispatch, token]);

  const handleDownloadReport = () => {
    // Prepare data for Excel export
    const reportData = [
      ["Statistics Report", ""],
      ["Generated Date", new Date().toLocaleString()],
      ["", ""],
      ["Metric", "Value"],
      ["Total Courses", stats?.totalCourses || 0],
      ["Total Teachers", teachers.length],
      ["Total Students", students.length],
      ["Total Subjects", stats?.totalSubjects || 0],
      ["", ""],
      ["Teachers List", ""],
      ["Name", "Email"],
      ...teachers.map((teacher) => [teacher.fullName, teacher.email]),
      ["", ""],
      ["Students List", ""],
      ["Name", "Email"],
      ...students.map((student) => [student.fullName, student.email]),
    ];

    // Create a workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(reportData);

    // Set column widths
    ws["!cols"] = [{ wch: 20 }, { wch: 30 }];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Statistics Report");

    // Generate filename with current date
    const fileName = `Admin_Statistics_Report_${new Date()
      .toISOString()
      .split("T")[0]}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);
  };

  const renderContent = () => {
    switch (activeView) {
      case "users":
        return <UserManagement />;
      case "createTeacher":
        return <CreateTeacher />;
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
                <i className="bi bi-shield-check text-primary me-3"></i>
                {t("pages.adminDashboard.title")}
              </h1>
              <p
                className="lead mb-4"
                style={{ color: isDark ? "#f8f9fa" : "#2c3e50", fontWeight: 600 }}
              >
                {t("pages.adminDashboard.welcome", { name: user?.fullName })}
              </p>
              {/* <div className="alert alert-primary border-0 rounded-3 mb-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <div className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-crown-fill me-3 fs-4"></i>
                  <div>
                    <h5 className="mb-1 fw-bold">{t('pages.adminDashboard.adminPrivileges')}</h5>
                    <p className="mb-0 small">{t('pages.adminDashboard.adminDescription')}</p>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Download Report Button */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-success px-4 py-2 rounded-3 fw-semibold"
                    onClick={handleDownloadReport}
                  >
                    <i className="bi bi-file-earmark-excel-fill me-2"></i>
                    Download Statistics Report (XLSX)
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="row g-4 mb-5">
              <div className="col-lg-3 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p className="text-muted mb-1">
                          {t("pages.adminDashboard.stats.totalCourses")}
                        </p>
                        <h2 className="fw-bold mb-0">
                          {stats?.totalCourses || 0}
                        </h2>
                      </div>
                      <div
                        className="p-3 rounded-3 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: "#0d6efd" }}
                      >
                        <i className="bi bi-collection-fill text-white fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p className="text-muted mb-1">
                          {t("pages.adminDashboard.stats.teachers")}
                        </p>
                        <h2 className="fw-bold mb-0">{teachers.length}</h2>
                      </div>
                      <div
                        className="p-3 rounded-3 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: "#0dcaf0" }}
                      >
                        <i className="bi bi-person-badge-fill text-white fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p className="text-muted mb-1">
                          {t("pages.adminDashboard.stats.students")}
                        </p>
                        <h2 className="fw-bold mb-0">{students.length}</h2>
                      </div>
                      <div
                        className="p-3 rounded-3 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: "#198754" }}
                      >
                        <i className="bi bi-mortarboard-fill text-white fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p className="text-muted mb-1">
                          {t("pages.adminDashboard.stats.subjects")}
                        </p>
                        <h2 className="fw-bold mb-0">
                          {stats?.totalSubjects || 0}
                        </h2>
                      </div>
                      <div
                        className="p-3 rounded-3 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: "#fd7e14" }}
                      >
                        <i className="bi bi-bookmark-fill text-white fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="row g-4">
              <div className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <i
                        className="bi bi-people-fill text-primary"
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>
                    <h4 className="card-title fw-bold mb-3 text-primary">
                      {t("pages.adminDashboard.actions.userManagement.title")}
                    </h4>
                    <p className="card-text text-muted mb-4">
                      {t(
                        "pages.adminDashboard.actions.userManagement.description"
                      )}
                    </p>
                    <button
                      className="btn btn-primary px-4 py-2 rounded-3 fw-semibold"
                      onClick={() => setActiveView("users")}
                    >
                      <i className="bi bi-gear-fill me-2"></i>
                      {t("pages.adminDashboard.actions.userManagement.button")}
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <i
                        className="bi bi-person-plus-fill text-info"
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>
                    <h4 className="card-title fw-bold mb-3 text-primary">
                      {t("pages.adminDashboard.actions.createTeacher.title")}
                    </h4>
                    <p className="card-text text-muted mb-4">
                      {t(
                        "pages.adminDashboard.actions.createTeacher.description"
                      )}
                    </p>
                    <button
                      className="btn btn-info px-4 py-2 rounded-3 fw-semibold"
                      onClick={() => setActiveView("createTeacher")}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      {t("pages.adminDashboard.actions.createTeacher.button")}
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <i
                        className="bi bi-collection-fill text-success"
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>
                    <h4 className="card-title fw-bold mb-3 text-primary">
                      {t("pages.adminDashboard.actions.courseManagement.title")}
                    </h4>
                    <p className="card-text text-muted mb-4">
                      {t(
                        "pages.adminDashboard.actions.courseManagement.description"
                      )}
                    </p>
                    <button
                      className="btn btn-success px-4 py-2 rounded-3 fw-semibold"
                      onClick={() => setActiveView("courses")}
                    >
                      <i className="bi bi-eye-fill me-2"></i>
                      {t(
                        "pages.adminDashboard.actions.courseManagement.button"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-vh-100 bg-gradient-light">
      <div className="container py-5" style={{ marginTop: "4rem" }}>
        <div className="row justify-content-center">
          <div className="col-12">
            {activeView !== "dashboard" && (
              <button
                className="btn btn-outline-primary mb-3"
                onClick={() => setActiveView("dashboard")}
              >
                <i className="bi bi-arrow-left me-2"></i>
                {t("pages.adminDashboard.backToDashboard")}
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

export default AdminDashboard;
