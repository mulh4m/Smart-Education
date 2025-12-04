import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  return (
    <footer className="footer" style={{ background: isDark ? "var(--bg-tertiary)" : "#2c3e50", color: "var(--text-white)" }}>
      <div className="container py-5">
        <div className="row g-4">
          {/* Brand Section */}
          <div className="col-lg-4 col-md-6">
            <h4 className="fw-bold mb-3">
              <i className="bi bi-mortarboard-fill me-2"></i>
              {t("footer.brandName")}
            </h4>
            <p className="text-white-50">{t("footer.brandDescription")}</p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-white-50 hover-icon">
                <i
                  className="bi bi-facebook"
                  style={{ fontSize: "1.5rem" }}
                ></i>
              </a>
              <a href="#" className="text-white-50 hover-icon">
                <i className="bi bi-twitter" style={{ fontSize: "1.5rem" }}></i>
              </a>
              <a href="#" className="text-white-50 hover-icon">
                <i
                  className="bi bi-instagram"
                  style={{ fontSize: "1.5rem" }}
                ></i>
              </a>
              <a href="#" className="text-white-50 hover-icon">
                <i
                  className="bi bi-linkedin"
                  style={{ fontSize: "1.5rem" }}
                ></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          {/* <div className="col-lg-2 col-md-6">
            <h5 className="fw-bold mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a
                  href="#home"
                  className="text-white-50 text-decoration-none hover-link"
                >
                  {t("footer.links.home")}
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#about"
                  className="text-white-50 text-decoration-none hover-link"
                >
                  {t("footer.links.about")}
                </a>
              </li>
              <li className="mb-2">
                <Link
                  to="/register"
                  className="text-white-50 text-decoration-none hover-link"
                >
                  {t("footer.links.signUp")}
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/login"
                  className="text-white-50 text-decoration-none hover-link"
                >
                  {t("footer.links.signIn")}
                </Link>
              </li>
            </ul>
          </div> */}

          {/* Resources */}
          <div className="col-lg-3 col-md-6">
            <h5 className="fw-bold mb-3">
              {t("footer.resourcesTitle")}
            </h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a
                  href="#"
                  className="text-white-50 text-decoration-none hover-link"
                >
                  {t("footer.resources.helpCenter")}
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-white-50 text-decoration-none hover-link"
                >
                  {t("footer.resources.privacyPolicy")}
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-white-50 text-decoration-none hover-link"
                >
                  {t("footer.resources.termsOfService")}
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-white-50 text-decoration-none hover-link"
                >
                  {t("footer.resources.contactUs")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6">
            <h5 className="fw-bold mb-3">
              {t("footer.contactTitle")}
            </h5>
            <ul className="list-unstyled">
              <li className="mb-2 text-white-50">
                <i className="bi bi-geo-alt-fill me-2"></i>
                {t("footer.contact.address")}
              </li>
              <li className="mb-2 text-white-50">
                <i className="bi bi-envelope-fill me-2"></i>
                {t("footer.contact.email")}
              </li>
              <li className="mb-2 text-white-50">
                <i className="bi bi-telephone-fill me-2"></i>
                {t("footer.contact.phone")}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="row mt-4 pt-4 border-top border-secondary">
          <div className="col-md-6 text-center text-md-start">
            <p className="text-white-50 mb-0">
              © {currentYear} {t("footer.brandName")}. {t("footer.bottom.copyright")}
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="text-white-50 mb-0">
              {t("footer.bottom.madeWithLove")} <i className="bi bi-heart-fill text-danger"></i> 
              {" "}{t("footer.bottom.forStudents")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
