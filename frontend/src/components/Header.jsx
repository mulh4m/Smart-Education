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
    if (!isScrolled) return "rgba(255,255,255,0.9)";
    return isDark ? "#1a1a2e" : "#ffffff";
  };

  const getTextColor = () => {
    return isDark ? "#e0e0e0" : "#2c3e50";
  };

  const getBrandColor = () => {
    return isDark ? "#e0e0e0" : "#2c3e50";
  };

  const getBorderColor = () => {
    return "#667eea";
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
        isScrolled ? "shadow-lg" : ""
      }`}
      style={{
        background: getNavbarBg(),
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
        paddingTop: "0.875rem",
        paddingBottom: "0.875rem",
        minHeight: "70px",
        zIndex: 1030,
        borderBottom: "1px solid rgba(102, 126, 234, 0.1)",
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
          style={{
            borderColor: getBorderColor(),
            padding: "0.5rem",
            borderRadius: "8px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark
              ? "rgba(102, 126, 234, 0.1)"
              : "rgba(102, 126, 234, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
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
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <a
                    className="nav-link position-relative"
                    href="#home"
                    style={{
                      color: getTextColor(),
                      fontWeight: "500",
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#667eea";
                      e.currentTarget.style.backgroundColor = isDark
                        ? "rgba(102, 126, 234, 0.1)"
                        : "rgba(102, 126, 234, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = getTextColor();
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {t("header.home")}
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link position-relative"
                    href="#about"
                    style={{
                      color: getTextColor(),
                      fontWeight: "500",
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#667eea";
                      e.currentTarget.style.backgroundColor = isDark
                        ? "rgba(102, 126, 234, 0.1)"
                        : "rgba(102, 126, 234, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = getTextColor();
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {t("header.about")}
                  </a>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link border-0 p-0 d-flex align-items-center"
                    onClick={toggleLanguage}
                    style={{
                      color: getTextColor(),
                      fontWeight: "500",
                      textDecoration: "none",
                      background: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                    }}
                    title={i18n.language === "en" ? "العربية" : "English"}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#667eea";
                      e.currentTarget.style.backgroundColor = isDark
                        ? "rgba(102, 126, 234, 0.1)"
                        : "rgba(102, 126, 234, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = getTextColor();
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
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
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "rotate(15deg) scale(1.1)";
                      e.currentTarget.style.borderColor = "#667eea";
                      e.currentTarget.style.color = "#667eea";
                      e.currentTarget.style.backgroundColor = "rgba(102,126,234,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "rotate(0deg) scale(1)";
                      e.currentTarget.style.borderColor = getBorderColor();
                      e.currentTarget.style.color = getTextColor();
                      e.currentTarget.style.backgroundColor = isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)";
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
                      borderRadius: "8px",
                      fontWeight: "500",
                      transition: "all 0.3s ease",
                      borderWidth: "2px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(102, 126, 234, 0.3)";
                      e.currentTarget.style.backgroundColor = "#667eea";
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.borderColor = "#667eea";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = getBorderColor();
                      e.currentTarget.style.borderColor = getBorderColor();
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
                      borderRadius: "8px",
                      fontWeight: "500",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(102, 126, 234, 0.4)";
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 15px rgba(102, 126, 234, 0.3)";
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
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
                    className="nav-link d-flex align-items-center"
                    style={{
                      color: getTextColor(),
                      fontWeight: "500",
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#667eea";
                      e.currentTarget.style.backgroundColor = isDark
                        ? "rgba(102, 126, 234, 0.1)"
                        : "rgba(102, 126, 234, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = getTextColor();
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <i className="bi bi-house-fill me-1"></i>
                    {t("header.dashboard")}
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link border-0 p-0 d-flex align-items-center"
                    onClick={toggleLanguage}
                    style={{
                      color: getTextColor(),
                      fontWeight: "500",
                      textDecoration: "none",
                      background: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                    }}
                    title={i18n.language === "en" ? "العربية" : "English"}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#667eea";
                      e.currentTarget.style.backgroundColor = isDark
                        ? "rgba(102, 126, 234, 0.1)"
                        : "rgba(102, 126, 234, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = getTextColor();
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
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
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "rotate(15deg) scale(1.1)";
                      e.currentTarget.style.borderColor = "#667eea";
                      e.currentTarget.style.color = "#667eea";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "rotate(0deg) scale(1)";
                      e.currentTarget.style.borderColor = getBorderColor();
                      e.currentTarget.style.color = getTextColor();
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
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#667eea";
                      e.currentTarget.style.backgroundColor = isDark
                        ? "rgba(102, 126, 234, 0.1)"
                        : "rgba(102, 126, 234, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = getTextColor();
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <i
                      className="bi bi-person-circle me-2"
                      style={{ fontSize: "1.3rem" }}
                    ></i>
                    <span className="d-none d-md-inline">
                      {user?.fullName || t("common.user")}
                    </span>
                    <i
                      className={`bi bi-chevron-${
                        isDropdownOpen ? "up" : "down"
                      } ms-2`}
                      style={{ fontSize: "0.75rem", transition: "transform 0.3s ease" }}
                    ></i>
                  </button>
                  {isDropdownOpen && (
                    <ul
                      className="dropdown-menu dropdown-menu-end shadow-lg border-0 show"
                      style={{
                        minWidth: "240px",
                        backgroundColor: getDropdownBg(),
                        border: isDark ? "1px solid rgba(102, 126, 234, 0.2)" : "none",
                        borderRadius: "12px",
                        padding: "0.5rem",
                        marginTop: "0.5rem",
                        animation: "fadeInUp 0.3s ease",
                      }}
                    >
                      <li>
                        <div
                          className="dropdown-header"
                          style={{
                            backgroundColor: getDropdownHeaderBg(),
                            borderRadius: "8px",
                            padding: "1rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <div
                              style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: "0.75rem",
                              }}
                            >
                              <i
                                className="bi bi-person-fill text-white"
                                style={{ fontSize: "1.5rem" }}
                              ></i>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div
                                className="fw-semibold"
                                style={{
                                  color: getDropdownTextColor(),
                                  fontSize: "0.95rem",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                {user?.fullName || t("common.user")}
                              </div>
                              <small
                                className="text-capitalize d-block"
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
                        <Link
                          className="dropdown-item py-2 d-flex align-items-center"
                          to="/dashboard"
                          onClick={closeDropdown}
                          style={{
                            color: getDropdownTextColor(),
                            borderRadius: "8px",
                            transition: "all 0.2s ease",
                            marginBottom: "0.25rem",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark
                              ? "rgba(102, 126, 234, 0.15)"
                              : "rgba(102, 126, 234, 0.1)";
                            e.currentTarget.style.transform = "translateX(4px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.transform = "translateX(0)";
                          }}
                        >
                          <i className="bi bi-speedometer2 me-2 text-primary"></i>
                          {t("header.dashboard")}
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item py-2 d-flex align-items-center"
                          to="/profile"
                          onClick={closeDropdown}
                          style={{
                            color: getDropdownTextColor(),
                            borderRadius: "8px",
                            transition: "all 0.2s ease",
                            marginBottom: "0.25rem",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark
                              ? "rgba(102, 126, 234, 0.15)"
                              : "rgba(102, 126, 234, 0.1)";
                            e.currentTarget.style.transform = "translateX(4px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.transform = "translateX(0)";
                          }}
                        >
                          <i className="bi bi-person-gear me-2 text-success"></i>
                          Profile Settings
                        </Link>
                      </li>
                      <li>
                        <hr
                          className="dropdown-divider my-2"
                          style={{
                            borderColor: isDark
                              ? "rgba(102, 126, 234, 0.2)"
                              : "rgba(0, 0, 0, 0.1)",
                            opacity: 1,
                            margin: "0.5rem 0",
                          }}
                        />
                      </li>
                      <li>
                        <button
                          className="dropdown-item py-2 text-danger fw-semibold d-flex align-items-center"
                          onClick={handleLogout}
                          style={{
                            border: "none",
                            background: "none",
                            width: "100%",
                            textAlign: "left",
                            borderRadius: "8px",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark
                              ? "rgba(220, 53, 69, 0.15)"
                              : "rgba(220, 53, 69, 0.1)";
                            e.currentTarget.style.transform = "translateX(4px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.transform = "translateX(0)";
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
