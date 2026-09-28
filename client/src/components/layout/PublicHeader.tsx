import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const navLinks = [
  { key: "home", path: "/" },
  { key: "diplomas", path: "/diplomas" },
  { key: "staff", path: "/staff" },
  { key: "gallery", path: "/gallery" },
  { key: "about", path: "/about" },
  { key: "contact", path: "/contact" },
];

export function PublicHeader() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isRTL = i18n.language === "ar";

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="HTCT Logo"
              className="h-10 w-auto md:h-12"
            />
            <span className="font-bold text-lg text-foreground hidden sm:block">
              {isRTL
                ? "مركز الهيثم للتأهيل والتدريب السياحي"
                : "Al Haytham Training Center"}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.key}
                  to={link.path}
                  className={[
                    "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-foreground/80 hover:text-foreground",
                    "hover:bg-secondary/70",
                  ].join(" ")}
                >
                  {t(`nav.${link.key}`)}
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-[9px] h-[2px] bg-accent rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isRTL ? "English" : "العربية"}
              </span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-card"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={[
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === link.path
                      ? "bg-secondary text-foreground"
                      : "text-foreground/80 hover:text-foreground hover:bg-secondary/70",
                  ].join(" ")}
                >
                  {t(`nav.${link.key}`)}
                </Link>
              ))}

              <div className="pt-3">
                <Button asChild variant="accent" className="w-full">
                  <Link to="/diplomas" onClick={() => setMobileMenuOpen(false)}>
                    {isRTL ? "استعرض الدبلومات" : "Explore Programs"}
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
