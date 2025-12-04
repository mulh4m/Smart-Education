import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  logout,
  selectUser,
  selectIsAuthenticated,
} from "../store/slices/authSlice";
import { loadBootstrapCSS } from "../utils/bootstrapLoader";
import { useTheme } from "../contexts/ThemeContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { toggleTheme, isDark } = useTheme();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);

    // Update document direction for RTL support
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;

    // Reload Bootstrap CSS with appropriate RTL/LTR version
    loadBootstrapCSS(newLang === "ar");
  };

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Set initial document direction
  useEffect(() => {
    const currentLang = i18n.language;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  // Theme-aware color functions
  const getNavbarBg = () => {
    if (!isScrolled) return "transparent";
    return isDark ? "#1a1a2e" : "#ffffff";
  };

  const getTextColor = () => {
    if (!isScrolled) return "#fff";
    return isDark ? "#e0e0e0" : "#2c3e50";
  };

  const getBrandColor = () => {
    if (!isScrolled) return "#fff";
    return "#667eea";
  };

  const getBorderColor = () => {
    if (!isScrolled) return "#fff";
    return isDark ? "#667eea" : "#667eea";
  };

  const getDropdownBg = () => {
    return isDark ? "#2d2d44" : "#ffffff";
  };

  const getDropdownHeaderBg = () => {
    return isDark ? "#3a3a52" : "#f8f9fa";
  };

  const getDropdownTextColor = () => {
    return isDark ? "#e0e0e0" : "#212529";
  };

  const getDropdownMutedColor = () => {
    return isDark ? "#b0b0b0" : "#6c757d";
  };

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top ${
        isScrolled ? "shadow" : ""
      }`}
      style={{
        background: getNavbarBg(),
        transition: "all 0.3s ease",
      }}
    >
      <div className="container">
        <Link
          className="navbar-brand fw-bold"
          to="/"
          style={{ color: getBrandColor(), fontSize: "1.5rem" }}
        >
          <i className="bi bi-mortarboard-fill me-2"></i>
          {t("header.brand")}
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          style={{ borderColor: getBorderColor() }}
        >
          <span
            className="navbar-toggler-icon"
            style={{
              backgroundImage:
                !isScrolled || isDark
                  ? `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 0.85)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e")`
                  : undefined,
            }}
          ></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#home"
                    style={{
                      color: getTextColor(),
                      fontWeight: "500",
                    }}
                  >
                    {t("header.home")}
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#about"
                    style={{
                      color: getTextColor(),
                      fontWeight: "500",
                    }}
                  >
                    {t("header.about")}
                  </a>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link border-0 p-0"
                    onClick={toggleLanguage}
                    style={{
                      color: getTextColor(),
                      fontWeight: "500",
                      textDecoration: "none",
                      background: "none",
                    }}
                    title={i18n.language === "en" ? "العربية" : "English"}
                  >
                    <i className="bi bi-translate me-1"></i>
                    <span className="d-none d-md-inline">
                      {i18n.language === "en" ? "العربية" : "English"}
                    </span>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    title={
                      isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
                    }
                    style={{
                      color: getTextColor(),
                      borderColor: getBorderColor(),
                    }}
                  >
                    <i
                      className={`bi ${
                        isDark ? "bi-sun-fill" : "bi-moon-fill"
                      }`}
                    ></i>
                  </button>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link
                    to="/login"
                    className="btn btn-outline-primary px-4"
                    style={{
                      borderColor: getBorderColor(),
                      color: getBorderColor(),
                      backgroundColor: "transparent",
                    }}
                  >
                    {t("header.signIn")}
                  </Link>
                </li>
                <li className="nav-item ms-2">
                  <Link
                    to="/register"
                    className="btn btn-primary px-4"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      color: "#fff",
                    }}
                  >
                    {t("header.getStarted")}
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    to="/dashboard"
                    className="nav-link"
                    style={{
                      color: getTextColor(),
                      fontWeight: "500",
                    }}
                  >
                    <i className="bi bi-house-fill me-1"></i>
                    {t("header.dashboard")}
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link border-0 p-0"
                    onClick={toggleLanguage}
                    style={{
                      color: getTextColor(),
                      fontWeight: "500",
                      textDecoration: "none",
                      background: "none",
                    }}
                    title={i18n.language === "en" ? "العربية" : "English"}
                  >
                    <i className="bi bi-translate me-1"></i>
                    <span className="d-none d-md-inline">
                      {i18n.language === "en" ? "العربية" : "English"}
                    </span>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    title={
                      isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
                    }
                    style={{
                      color: getTextColor(),
                      borderColor: getBorderColor(),
                    }}
                  >
                    <i
                      className={`bi ${
                        isDark ? "bi-sun-fill" : "bi-moon-fill"
                      }`}
                    ></i>
                  </button>
                </li>
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle d-flex align-items-center btn btn-link border-0 p-0"
                    onClick={toggleDropdown}
                    style={{
                      color: getTextColor(),
                      fontWeight: "500",
                      textDecoration: "none",
                      background: "none",
                    }}
                  >
                    <i
                      className="bi bi-person-circle me-2"
                      style={{ fontSize: "1.2rem" }}
                    ></i>
                    <span className="d-none d-md-inline">
                      {user?.fullName || t("common.user")}
                    </span>
                    <i
                      className={`bi bi-chevron-${
                        isDropdownOpen ? "up" : "down"
                      } ms-1`}
                      style={{ fontSize: "0.8rem" }}
                    ></i>
                  </button>
                  {isDropdownOpen && (
                    <ul
                      className="dropdown-menu dropdown-menu-end shadow border-0 show"
                      style={{
                        minWidth: "200px",
                        backgroundColor: getDropdownBg(),
                        border: isDark ? "1px solid #3a3a52" : "none",
                      }}
                    >
                      <li>
                        <div
                          className="dropdown-header"
                          style={{ backgroundColor: getDropdownHeaderBg() }}
                        >
                          <div className="d-flex align-items-center">
                            <i
                              className="bi bi-person-circle text-primary me-2"
                              style={{ fontSize: "1.5rem" }}
                            ></i>
                            <div>
                              <div
                                className="fw-semibold"
                                style={{ color: getDropdownTextColor() }}
                              >
                                {user?.fullName || t("common.user")}
                              </div>
                              <small
                                className="text-capitalize"
                                style={{ color: getDropdownMutedColor() }}
                              >
                                {user?.role || t("common.unknown")}{" "}
                                {t("header.userAccount")}
                              </small>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li>
                        <hr
                          className="dropdown-divider my-2"
                          style={{
                            borderColor: isDark ? "#3a3a52" : "#dee2e6",
                            opacity: 1,
                          }}
                        />
                      </li>
                      <li>
                        <Link
                          className="dropdown-item py-2"
                          to="/dashboard"
                          onClick={closeDropdown}
                          style={{ color: getDropdownTextColor() }}
                        >
                          <i className="bi bi-speedometer2 me-2 text-primary"></i>
                          {t("header.dashboard")}
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item py-2"
                          to="/profile"
                          onClick={closeDropdown}
                          style={{ color: getDropdownTextColor() }}
                        >
                          <i className="bi bi-person-gear me-2 text-success"></i>
                          Profile Settings
                        </Link>
                      </li>
                      <li>
                        <hr
                          className="dropdown-divider my-2"
                          style={{
                            borderColor: isDark ? "#3a3a52" : "#dee2e6",
                            opacity: 1,
                          }}
                        />
                      </li>
                      <li>
                        <button
                          className="dropdown-item py-2 text-danger fw-semibold"
                          onClick={handleLogout}
                          style={{
                            border: "none",
                            background: "none",
                            width: "100%",
                            textAlign: "left",
                          }}
                        >
                          <i className="bi bi-box-arrow-right me-2"></i>
                          {t("header.signOut")}
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header; 
