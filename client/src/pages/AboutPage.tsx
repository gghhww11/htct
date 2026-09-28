import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  Target,
  Users,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  ChefHat,
  Camera,
  Hotel,
  CheckCircle2,
  Monitor,
  CookingPot,
  Ruler,
  Home as HomeIcon,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { PublicLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

function AboutHero() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const heroImageUrl = `${import.meta.env.BASE_URL}imgs/bg_ab.png`;

  return (
    <section className="relative overflow-hidden text-primary-foreground">
      <div className="absolute inset-0">
        <img
          src={heroImageUrl}
          alt={isRTL ? "صورة من المركز" : "Center photo"}
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>

      <div
        className="absolute inset-0 opacity-50 mix-blend-multiply"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/55" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 min-h-[520px] md:min-h-[600px] flex items-end">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className={`max-w-3xl ${isRTL ? "ml-auto text-right" : "mr-auto text-left"} pb-16 md:pb-20`}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
              {t("about.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/85 leading-relaxed">
              {t("about.hero.subtitle")}
            </p>

            <div
              className={`mt-8 flex flex-col sm:flex-row gap-4 ${isRTL ? "justify-end" : "justify-start"}`}
            >
              <Button
                asChild
                variant="accent"
                className="rounded-full px-8"
                style={{ boxShadow: "var(--shadow-accent)" }}
              >
                <Link to="/diplomas">{t("about.programs.cta")}</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-full px-8 bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/contact">{t("nav.contact")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const values = [
    {
      icon: ShieldCheck,
      title: t("about.values.items.v1.title"),
      desc: t("about.values.items.v1.desc"),
    },
    {
      icon: Users,
      title: t("about.values.items.v2.title"),
      desc: t("about.values.items.v2.desc"),
    },
    {
      icon: Award,
      title: t("about.values.items.v3.title"),
      desc: t("about.values.items.v3.desc"),
    },
  ];

  const programCards = [
    { key: "travel", icon: Briefcase },
    { key: "culinary", icon: ChefHat },
    { key: "media", icon: Camera },
    { key: "management", icon: Hotel },
  ] as const;

  const goalKeys = ["g1", "g2", "g3", "g4", "g5", "g6"] as const;

  const facilityCards = [
    { key: "classrooms", icon: HomeIcon },
    { key: "computers", icon: Monitor },
    { key: "studio", icon: Camera },
    { key: "kitchen", icon: CookingPot },
    { key: "nutrition", icon: Ruler },
    { key: "space", icon: Sparkles },
  ] as const;

  // ✅ NEW: Long facility bullets (translated as arrays)
  const facilitiesBulletsKeys = ["b1", "b2", "b3", "b4", "b5", "b6"] as const;
  const visionImportanceKeys = ["p1", "p2", "p3"] as const;

  return (
    <PublicLayout>
      <Helmet>
        <title>{t("about.seo.title")}</title>
        <meta name="description" content={t("about.seo.description")} />
        <meta property="og:title" content={t("about.seo.title")} />
        <meta property="og:description" content={t("about.seo.description")} />
        <meta property="og:type" content="website" />
      </Helmet>

      <AboutHero />

      {/* Story / Overview */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5">
                {t("about.story.title")}
              </h2>

              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("about.story.p1")}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("about.story.p2")}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.story.p3")}
              </p>

              <div className="mt-7 grid sm:grid-cols-2 gap-3">
                {[
                  isRTL
                    ? "تخصص سياحة وضيافة وفندقة"
                    : "Tourism & hospitality specialization",
                  isRTL ? "تدريب نظري + عملي" : "Theory + hands-on practice",
                  isRTL ? "مسارات متنوعة وفرص عمل" : "Tracks with career paths",
                  isRTL ? "بيئة تدريب حديثة" : "Modern training environment",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 text-foreground"
                  >
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="rounded-2xl overflow-hidden">
                <div className="relative h-80">
                  <img
                    src={`${import.meta.env.BASE_URL}imgs/hall.png`}
                    alt={isRTL ? "قاعات وتدريب" : "Training environment"}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
                  <div className="absolute inset-0 ring-1 ring-black/5" />
                </div>
              </Card>

              <Card className="mt-6 rounded-2xl p-6">
                <div className="text-sm text-muted-foreground mb-2">
                  {isRTL ? "لماذا هذا مهم؟" : "Why it matters"}
                </div>
                <div className="text-foreground leading-relaxed">
                  {isRTL
                    ? "لأن التدريب السياحي والفندقي يعتمد على التطبيق الواقعي، فالتجهيزات والبيئة العملية تصنع فرقًا كبيرًا في جاهزية المتدرب للعمل."
                    : "Tourism and hospitality training is practice-driven—facilities and real-world simulation significantly improve job readiness."}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ✅ NEW: Vision Importance (Your long text #1 intro) */}
      <section className="py-16 bg-secondary/40">
        <div className="container mx-auto px-4">
          <SectionHeading
            title={t("about.visionImportance.title")}
            subtitle={t("about.visionImportance.subtitle")}
          />

          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            {visionImportanceKeys.map((k, idx) => (
              <motion.div
                key={k}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card className="rounded-2xl p-7 h-full">
                  <p className="text-muted-foreground leading-relaxed">
                    {t(`about.visionImportance.${k}`)}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision / Mission (updated text keys in translations) */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading title={t("about.vm.title")} />

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundImage: "var(--gradient-primary)",
                    boxShadow: "var(--shadow-primary)",
                  }}
                >
                  <Target className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {t("about.vm.missionTitle")}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.vm.missionText")}
              </p>
            </Card>

            <Card className="rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundImage: "var(--gradient-accent)",
                    boxShadow: "var(--shadow-accent)",
                  }}
                >
                  <Sparkles className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {t("about.vm.visionTitle")}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.vm.visionText")}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="py-16 bg-secondary/40">
        <div className="container mx-auto px-4">
          <SectionHeading
            title={t("about.goals.title")}
            subtitle={t("about.goals.subtitle")}
          />

          <div className="grid md:grid-cols-2 gap-6">
            {goalKeys.map((g, idx) => (
              <motion.div
                key={g}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                viewport={{ once: true }}
              >
                <Card className="rounded-2xl p-7">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-accent mt-0.5" />
                    <p className="text-foreground leading-relaxed">
                      {t(`about.goals.items.${g}`)}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ Facilities (Detailed) + NEW long description (Your long text #2) */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading
            title={t("about.facilities.title")}
            subtitle={t("about.facilities.subtitle")}
          />

          <Card className="rounded-2xl p-8 mb-10">
            <p className="text-muted-foreground leading-relaxed mb-5">
              {t("about.facilitiesLong.p1")}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">
                  {t("about.facilitiesLong.pointsTitle")}
                </h4>
                <ul className="space-y-2">
                  {facilitiesBulletsKeys.map((k) => (
                    <li key={k} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">
                        {t(`about.facilitiesLong.points.${k}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3">
                  {t("about.facilitiesLong.summaryTitle")}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {t("about.facilitiesLong.p2")}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilityCards.map((f, idx) => (
              <motion.div
                key={f.key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.07 }}
                viewport={{ once: true }}
              >
                <Card className="rounded-2xl p-7 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-accent/10">
                      <f.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {t(`about.facilities.items.${f.key}.title`)}
                    </h3>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {t(`about.facilities.items.${f.key}.desc`)}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 grid lg:grid-cols-3 gap-6">
            {["center_3.png", "center_4.png", "center_2.png"].map(
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

      {/* Programs */}
      <section className="py-16 bg-secondary/40">
        <div className="container mx-auto px-4">
          <SectionHeading
            title={t("about.programs.title")}
            subtitle={t("about.programs.subtitle")}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programCards.map((p, idx) => (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.07 }}
                viewport={{ once: true }}
              >
                <Card className="rounded-2xl p-7 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-accent/10">
                      <p.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {t(`about.programs.items.${p.key}.title`)}
                    </h3>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {t(`about.programs.items.${p.key}.desc`)}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button asChild className="rounded-full px-8">
              <Link to="/diplomas">{t("about.programs.cta")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading title={t("about.values.title")} />

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {values.map((v, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card className="rounded-2xl p-8 text-center h-full flex flex-col">
                  <div
                    className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundImage: "var(--gradient-primary)",
                      boxShadow: "var(--shadow-primary)",
                    }}
                  >
                    <v.icon className="w-8 h-8 text-primary-foreground" />
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {v.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    {v.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
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
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-5">
              {t("about.cta.title")}
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              {t("about.cta.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                variant="accent"
                className="rounded-full px-8"
                style={{ boxShadow: "var(--shadow-accent)" }}
              >
                <Link to="/diplomas">
                  {t("about.cta.diplomas")}
                  <GraduationCap className="w-5 h-5 ms-2" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-8 bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/contact">{t("about.cta.contact")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
