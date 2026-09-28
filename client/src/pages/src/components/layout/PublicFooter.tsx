import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export function PublicFooter() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { key: "home", path: "/" },
    { key: "diplomas", path: "/diplomas" },
    { key: "staff", path: "/staff" },
    { key: "gallery", path: "/gallery" },
    { key: "about", path: "/about" },
    { key: "contact", path: "/contact" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="HTCT Logo"
                  className="h-10 w-auto brightness-0 invert"
                />
                <span className="font-bold text-lg">
                  {isRTL
                    ? "مركز الهيثم للتأهيل والتدريب السياحي"
                    : "Al Haytham Training Center"}
                </span>
              </div>
            </div>

            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              {isRTL
                ? "برامج تدريبية ودبلومات متخصصة تُصمم لتمكين المتدربين وبناء مسار مهني قوي."
                : "Specialized diplomas and training programs designed to empower learners and build strong career paths."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.path}
                    className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info (placeholder) */}
          <div>
            <h4 className="font-semibold text-lg mb-4">
              {t("footer.contactInfo")}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  {isRTL
                    ? "ريف دمشق - التل - حي الروس"
                    : "Al-Tal - Rid Dimashq"}
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span dir="ltr">+963 965 787 804</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>alhaythamtourism@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-lg mb-4">
              {t("footer.followUs")}
            </h4>
            <div className="flex gap-3">
              {[
                {
                  Icon: Facebook,
                  url: "https://www.facebook.com/AlHaythamTrainingCenter",
                },
                {
                  Icon: Instagram,
                  url: "https://www.instagram.com/alhaytham.education",
                },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 mt-10 pt-8 text-center text-sm text-primary-foreground/60">
          © {currentYear}{" "}
          {isRTL
            ? "مركز الهيثم للتأهيل والتدريب سياحي"
            : "Al Haytham Training Center"}
          . {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
