import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: "bi-book-fill",
      title: t("about.features.qualityEducation.title"),
      description: t("about.features.qualityEducation.description"),
      color: "#667eea",
    },
    {
      icon: "bi-people-fill",
      title: t("about.features.communitySupport.title"),
      description: t("about.features.communitySupport.description"),
      color: "#764ba2",
    },
    {
      icon: "bi-graph-up",
      title: t("about.features.trackProgress.title"),
      description: t("about.features.trackProgress.description"),
      color: "#f093fb",
    },
    {
      icon: "bi-award-fill",
      title: t("about.features.certifications.title"),
      description: t("about.features.certifications.description"),
      color: "#4facfe",
    },
    {
      icon: "bi-clock-fill",
      title: t("about.features.flexibleLearning.title"),
      description: t("about.features.flexibleLearning.description"),
      color: "#43e97b",
    },
    {
      icon: "bi-shield-check",
      title: t("about.features.securePlatform.title"),
      description: t("about.features.securePlatform.description"),
      color: "#fa709a",
    },
  ];

  return (
    <section
      id="about"
      className="about-section py-5"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="container py-5">
        {/* Section Header */}
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold mb-3 text-primary">
            {t("about.title")}
          </h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
            {t("about.description")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="row g-4 mb-5">
          {features.map((feature, index) => (
            <div key={index} className="col-lg-4 col-md-6">
              <div
                className="card h-100 border-0 shadow-sm hover-card"
                style={{
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 10px rgba(0,0,0,0.05)";
                }}
              >
                <div className="card-body p-4">
                  <div
                    className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "60px",
                      height: "60px",
                      background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}dd 100%)`,
                    }}
                  >
                    <i
                      className={`bi ${feature.icon} text-white`}
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                  </div>
                  <h5
                    className="card-title fw-bold mb-3"
                    style={{ color: "#2c3e50" }}
                  >
                    {feature.title}
                  </h5>
                  <p className="card-text text-muted">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="row mt-5 pt-5 border-top">
          <div className="col-md-3 col-6 text-center mb-4">
            <h2 className="fw-bold" style={{ color: "#667eea" }}>
              10,000+
            </h2>
            <p className="text-muted">{t("about.stats.activeStudents")}</p>
          </div>
          <div className="col-md-3 col-6 text-center mb-4">
            <h2 className="fw-bold" style={{ color: "#764ba2" }}>
              500+
            </h2>
            <p className="text-muted">{t("about.stats.coursesAvailable")}</p>
          </div>
          <div className="col-md-3 col-6 text-center mb-4">
            <h2 className="fw-bold" style={{ color: "#f093fb" }}>
              100+
            </h2>
            <p className="text-muted">{t("about.stats.expertInstructors")}</p>
          </div>
          <div className="col-md-3 col-6 text-center mb-4">
            <h2 className="fw-bold" style={{ color: "#4facfe" }}>
              95%
            </h2>
            <p className="text-muted">{t("about.stats.successRate")}</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-5">
          <div
            className="card border-0 shadow-lg p-5 rounded-4"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <h3 className="text-white fw-bold mb-3">{t("about.cta.title")}</h3>
            <p className="text-white mb-4">{t("about.cta.description")}</p>

            <div>
              <a
                href="#home"
                className="btn btn-light btn-lg px-5 py-3"
                style={{ color: "#667eea", fontWeight: "600" }}
              >
                {t("about.cta.button")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
