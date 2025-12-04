import { Link } from "react-router-dom";
import heroImage from "../assets/sultan.jpg";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

const Hero = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  return (
    <section
      id="home"
      className="hero-section min-vh-100 d-flex align-items-center position-relative overflow-hidden"
      style={{
        paddingTop: "80px",
      }}
    >
      {/* Background Image with Overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      >
        {/* Multi-layered Gradient Overlay for better text readability */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background:
              "linear-gradient(135deg, rgba(102, 126, 234, 0.22) 0%, rgba(118, 75, 162, 0.68) 100%)",
            zIndex: 1,
          }}
        ></div>

        {/* Additional dark overlay for text contrast */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, transparent 0%, rgba(0, 0, 0, 0.3) 100%)",
            zIndex: 2,
          }}
        ></div>
      </div>

      {/* Animated Floating Elements */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ zIndex: 3 }}
      >
        <div
          className="position-absolute rounded-circle opacity-25"
          style={{
            width: "300px",
            height: "300px",
            background: "rgba(255, 255, 255, 0.1)",
            top: "10%",
            right: "10%",
            animation: "float 6s ease-in-out infinite",
          }}
        ></div>
        <div
          className="position-absolute rounded-circle opacity-25"
          style={{
            width: "200px",
            height: "200px",
            background: "rgba(255, 255, 255, 0.1)",
            bottom: "20%",
            left: "5%",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="container position-relative" style={{ zIndex: 4 }}>
        <div className="row align-items-center">
          <div className="col-lg-8 col-xl-7 text-white">
            <div className="mb-3">
              <span
                className="badge px-4 py-2 rounded-pill"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  fontSize: "0.9rem",
                }}
              >
                🚀 {t("hero.badge")}
              </span>
            </div>

            <h1
              className="display-2 fw-bold mb-4 animate__animated animate__fadeInLeft"
              style={{
                lineHeight: "1.2",
                textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              }}
            >
              {t("hero.title")}
            </h1>

            <p
              className="fs-5 mb-5 animate__animated animate__fadeInLeft animate__delay-1s"
              style={{
                maxWidth: "600px",
                lineHeight: "1.8",
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                opacity: "0.95",
              }}
            >
              {t("hero.description")}
            </p>

            <div className="d-flex flex-wrap gap-3 mb-5 animate__animated animate__fadeInUp animate__delay-2s">
              <Link
                to="/register"
                className="btn btn-light btn-lg px-5 py-3 shadow-lg"
                style={{
                  color: "#667eea",
                  fontWeight: "600",
                  border: "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(0, 0, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px rgba(0, 0, 0, 0.2)";
                }}
              >
                {t("hero.buttons.getStarted")}
              </Link>
              <a
                href="#about"
                className="btn btn-outline-light btn-lg px-5 py-3"
                style={{
                  fontWeight: "600",
                  backdropFilter: "blur(10px)",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "2px solid rgba(255, 255, 255, 0.5)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {t("hero.buttons.learnMore")}
              </a>
            </div>

            {/* Stats Cards */}
            <div className="row g-3">
              {[
                {
                  number: "10K+",
                  label: t("hero.stats.students.label"),
                  icon: "👥",
                },
                {
                  number: "500+",
                  label: t("hero.stats.courses.label"),
                  icon: "📚",
                },
                {
                  number: "4.8★",
                  label: t("hero.stats.rating.label"),
                  icon: "⭐",
                },
              ].map((stat, index) => (
                <div key={index} className="col-6 col-md-4">
                  <div
                    className="p-4 rounded-4"
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.25)";
                      e.currentTarget.style.transform = "translateY(-5px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.15)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div className="fs-4 mb-2">{stat.icon}</div>
                    <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
                      {stat.number}
                    </h3>
                    <p className="mb-0 small" style={{ opacity: "0.9" }}>
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Wave Divider */}
      <div
        className="position-absolute bottom-0 start-0 end-0"
        style={{
          height: "120px",
          background: isDark ? "var(--bg-primary)" : "white",
          clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0 100%)",
          zIndex: 5,
        }}
      ></div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.05);
          }
        }

        .btn:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>
    </section>
  );
};

export default Hero;
