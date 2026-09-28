import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Award,
  Users,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
  Briefcase,
  ChefHat,
  Camera,
  Hotel,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout";

const stats = [
  { key: "students", value: "5214+", icon: Users },
  { key: "diplomas", value: "5", icon: BookOpen },
  { key: "years", value: "20+", icon: Award },
  { key: "graduates", value: "3114+", icon: GraduationCap },
];

const features = [
  { key: "quality", icon: Award },
  { key: "experience", icon: BookOpen },
  { key: "certificates", icon: GraduationCap },
];

const programs = [
  { key: "travel", icon: Briefcase },
  { key: "culinary", icon: ChefHat },
  { key: "media", icon: Camera },
  { key: "hospitality", icon: Hotel },
] as const;

const facilities = [
  { key: "classrooms", icon: Sparkles },
  { key: "computers", icon: BookOpen },
  { key: "studio", icon: ImageIcon },
  { key: "kitchen", icon: ChefHat },
] as const;

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      ) : null}
      <div className="mt-4 mx-auto h-1 w-14 rounded-full bg-accent" />
    </div>
  );
}

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const heroImageUrl = `${import.meta.env.BASE_URL}imgs/center.png`;

  return (
    <PublicLayout>
      {/* SEO */}
      <Helmet>
        <title>{t("home.seo.title")}</title>
        <meta name="description" content={t("home.seo.description")} />
        <meta property="og:title" content={t("home.seo.title")} />
        <meta property="og:description" content={t("home.seo.description")} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden text-primary-foreground">
        <div className="absolute inset-0">
          <img
            src={heroImageUrl}
            alt={isRTL ? "مبنى مركز الهيثم" : "Al-Haytham Center Building"}
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
        </div>

        <div
          className="absolute inset-0 opacity-45 mix-blend-multiply"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/45" />

        {/* ✅ Content aligned to bottom + language-aware alignment */}
        <div className="relative z-10 min-h-screen flex items-end">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className={`max-w-3xl ${
                isRTL ? "ml-auto text-right" : "mr-auto text-left"
              } pb-24 md:pb-28`}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {t("home.hero.title")}
              </h1>

              <p className="text-lg md:text-xl text-primary-foreground/85 mb-10 max-w-2xl">
                {t("home.hero.subtitle")}
              </p>

              <div
                className={`flex flex-col sm:flex-row gap-4 ${
                  isRTL ? "justify-end" : "justify-start"
                }`}
              >
                <Button
                  asChild
                  size="lg"
                  variant="accent"
                  className="rounded-full px-8"
                  style={{ boxShadow: "var(--shadow-accent)" }}
                >
                  <Link to="/diplomas">
                    {t("home.hero.cta")}
                    <Arrow
                      className={isRTL ? "w-5 h-5 mr-2" : "w-5 h-5 ml-2"}
                    />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link to="/about">{t("nav.about")}</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2 text-primary-foreground/70">
            <span className="text-xs">{isRTL ? "اسحب للأسفل" : "Scroll"}</span>
            <div className="h-10 w-6 rounded-full border border-primary-foreground/30 flex items-start justify-center p-1">
              <div className="h-2 w-2 rounded-full bg-primary-foreground/70 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="text-center p-6 rounded-2xl">
                  <stat.icon className="w-10 h-10 mx-auto mb-4 text-accent" />
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {t(`home.stats.${stat.key}`)}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/40">
        <div className="container mx-auto px-4">
          <SectionHeading title={t("home.features.title")} />

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.12 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 rounded-2xl text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundImage: "var(--gradient-primary)",
                      boxShadow: "var(--shadow-primary)",
                    }}
                  >
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {t(`home.features.${feature.key}.title`)}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {t(`home.features.${feature.key}.description`)}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-secondary/40">
        <div className="container mx-auto px-4">
          <SectionHeading
            title={t("home.facilities.title")}
            subtitle={t("home.facilities.subtitle")}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((f, index) => (
              <motion.div
                key={f.key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="p-7 rounded-2xl text-center">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-xl flex items-center justify-center bg-accent/10">
                    <f.icon className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-foreground font-medium">
                    {t(`home.facilities.items.${f.key}`)}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Optional image row */}
          <div className="mt-10 grid lg:grid-cols-3 gap-6">
            {["center_1.png", "center_2.png", "center_3.png"].map(
              (img, idx) => (
                <Card key={img} className="overflow-hidden rounded-2xl">
                  <div className="relative h-56">
                    <img
                      src={`${import.meta.env.BASE_URL}imgs/${img}`}
                      alt={
                        isRTL
                          ? `صورة من المركز ${idx + 1}`
                          : `Center photo ${idx + 1}`
                      }
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
                    <div className="absolute inset-0 ring-1 ring-white/10" />
                  </div>
                </Card>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Programs Highlights */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading
            title={t("home.programs.title")}
            subtitle={t("home.programs.subtitle")}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((p, index) => (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="p-7 rounded-2xl h-full text-center flex flex-col items-center justify-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{
                      backgroundImage: "var(--gradient-primary)",
                      boxShadow: "var(--shadow-primary)",
                    }}
                  >
                    <p.icon className="w-7 h-7 text-primary-foreground" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t(`home.programs.items.${p.key}.title`)}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed max-w-[26ch]">
                    {t(`home.programs.items.${p.key}.desc`)}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              asChild
              size="lg"
              variant="accent"
              className="rounded-full px-10"
              style={{ boxShadow: "var(--shadow-accent)" }}
            >
              <Link to="/diplomas">
                {t("home.programs.cta")}
                <Arrow className={isRTL ? "w-5 h-5 mr-2" : "w-5 h-5 ml-2"} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 text-primary-foreground"
        style={{ backgroundImage: "var(--gradient-primary)" }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {isRTL
                ? "ابدأ رحلتك التعليمية اليوم"
                : "Start Your Journey Today"}
            </h2>

            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              {isRTL
                ? "انضم إلى المتدربين الذين يبنون مستقبلهم معنا عبر تدريب عملي ومحتوى متخصص."
                : "Join learners building their future with hands-on training and specialized content."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                variant="accent"
                className="rounded-full px-8"
                style={{ boxShadow: "var(--shadow-accent)" }}
              >
                <Link to="/diplomas">{t("diplomas.viewDetails")}</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-8 bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/contact">{t("nav.contact")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
