import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  GraduationCap,
  Compass,
} from "lucide-react";

import { PublicLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { i18n } = useTranslation();
  const location = useLocation();

  const isRTL = i18n.language === "ar";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <PublicLayout>
      <main className="relative min-h-[75vh] overflow-hidden bg-background">
        {/* Decorative background */}
        <div
          className="absolute inset-x-0 top-0 h-72 opacity-10"
          style={{
            backgroundImage: "var(--gradient-hero)",
          }}
        />

        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        <section className="relative container mx-auto px-4 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary"
            >
              <Compass className="h-10 w-10" />
            </motion.div>

            {/* 404 */}
            <div className="relative mb-4">
              <h1
                className="select-none text-[110px] font-black leading-none tracking-tight text-primary/10 sm:text-[150px] md:text-[190px]"
                aria-hidden="true"
              >
                404
              </h1>

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black text-primary sm:text-5xl md:text-6xl">
                  404
                </span>
              </div>
            </div>

            {/* Text */}
            <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              {isRTL
                ? "يبدو أن هذه الصفحة غير موجودة"
                : "It looks like this page doesn't exist"}
            </h2>

            <p className="mx-auto mb-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {isRTL
                ? "قد يكون الرابط غير صحيح، أو ربما تم نقل الصفحة إلى مكان آخر."
                : "The link may be incorrect, or the page may have been moved somewhere else."}
            </p>

            {/* Requested path */}
            <div className="mx-auto mb-9 max-w-xl">
              <div className="rounded-xl border border-border bg-card/70 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur">
                <span className="font-medium text-foreground">
                  {isRTL ? "المسار المطلوب:" : "Requested path:"}
                </span>{" "}
                <span
                  dir="ltr"
                  className="inline-block break-all font-mono text-xs sm:text-sm"
                >
                  {location.pathname}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                variant="default"
                size="lg"
                className="rounded-full px-7"
              >
                <Link to="/">
                  <Home className="me-2 h-5 w-5" />

                  {isRTL ? "العودة إلى الصفحة الرئيسية" : "Back to Home"}
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-7"
              >
                <Link to="/diplomas">
                  <GraduationCap className="me-2 h-5 w-5" />

                  {isRTL ? "استكشف الدبلومات" : "Explore Diplomas"}

                  <Arrow className="ms-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Bottom quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mx-auto mt-14 max-w-2xl border-t border-border pt-7 text-center"
          >
            <p className="mb-4 text-sm text-muted-foreground">
              {isRTL ? "يمكنك أيضًا الانتقال إلى:" : "You can also visit:"}
            </p>

            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
              <Link
                to="/staff"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {isRTL ? "فريق العمل" : "Our Team"}
              </Link>

              <Link
                to="/gallery"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {isRTL ? "معرض الصور" : "Gallery"}
              </Link>

              <Link
                to="/about"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {isRTL ? "عن المركز" : "About"}
              </Link>

              <Link
                to="/contact"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {isRTL ? "تواصل معنا" : "Contact"}
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </PublicLayout>
  );
}
