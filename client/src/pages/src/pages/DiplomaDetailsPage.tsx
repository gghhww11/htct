import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { PublicLayout } from "@/components/layout";
import { publicApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { assetUrl } from "@/utils/assestUrl";

const getBullets = (isRTL: boolean, ar?: string[], en?: string[]) => {
  const arr = (isRTL ? ar : en) ?? [];
  return Array.isArray(arr)
    ? arr.filter((x) => typeof x === "string" && x.trim().length > 0)
    : [];
};

export default function DiplomaDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const {
    data: diploma,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["diploma", slug],
    queryFn: () => publicApi.getDiplomaBySlug(slug!),
    enabled: !!slug,
  });

  const getLocalizedText = (arText?: string, enText?: string) =>
    isRTL ? arText || "" : enText || "";

  const WHATSAPP_NUMBER = "963965787804";

  const handleApplyWhatsApp = () => {
    const courseNameAr = diploma?.titleAr || "";
    const message = `مرحبا أرغب بالتقدم لكورس ${courseNameAr}\nهل هذا ممكن؟`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-4/5" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  if (error || !diploma) {
    return (
      <PublicLayout>
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <p className="text-destructive mb-4">{t("common.error")}</p>
            <Button
              onClick={() => refetch()}
              variant="accent"
              className="rounded-xl"
            >
              {t("common.retry")}
            </Button>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Header */}
      <section
        className="text-primary-foreground py-14"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Button
              asChild
              variant="outline"
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground rounded-full"
            >
              <Link to="/diplomas" className="inline-flex items-center gap-2">
                <BackArrow className="w-4 h-4" />
                {t("common.back")}
              </Link>
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mt-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {getLocalizedText(diploma.titleAr, diploma.titleEn)}
              </h1>
              <p className="text-primary-foreground/80 text-lg max-w-3xl">
                {getLocalizedText(diploma.descriptionAr, diploma.descriptionEn)}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-10">
            {/* Main */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-2 space-y-10"
            >
              {/* Image */}
              <Card className="overflow-hidden rounded-2xl">
                <div className="relative h-72 bg-secondary">
                  {diploma.imageUrl ? (
                    <img
                      src={assetUrl(diploma.imageUrl)}
                      alt={getLocalizedText(diploma.titleAr, diploma.titleEn)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundImage: "var(--gradient-primary)" }}
                    >
                      <span className="text-5xl font-bold text-primary-foreground/25">
                        {getLocalizedText(
                          diploma.titleAr,
                          diploma.titleEn,
                        ).charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 ring-1 ring-black/5 pointer-events-none" />
                </div>
              </Card>

              {/* Objectives */}
              {(diploma.objectivesAr || diploma.objectivesEn) && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    {t("diplomas.objectives")}
                  </h2>
                  <Card className="rounded-2xl p-6 bg-secondary/30">
                    <p className="text-foreground whitespace-pre-line leading-relaxed">
                      {getLocalizedText(
                        diploma.objectivesAr,
                        diploma.objectivesEn,
                      )}
                    </p>
                  </Card>
                </div>
              )}

              {/* Requirements */}
              {(diploma.requirementsAr || diploma.requirementsEn) && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    {t("diplomas.requirements")}
                  </h2>
                  <Card className="rounded-2xl p-6 bg-secondary/30">
                    <p className="text-foreground whitespace-pre-line leading-relaxed">
                      {getLocalizedText(
                        diploma.requirementsAr,
                        diploma.requirementsEn,
                      )}
                    </p>
                  </Card>
                </div>
              )}

              {/* Curriculum */}
              {(diploma.curriculumAr || diploma.curriculumEn) && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    {t("diplomas.curriculum")}
                  </h2>
                  <Card className="rounded-2xl p-6 bg-secondary/30">
                    <p className="text-foreground whitespace-pre-line leading-relaxed">
                      {getLocalizedText(
                        diploma.curriculumAr,
                        diploma.curriculumEn,
                      )}
                    </p>
                  </Card>
                </div>
              )}

              {/* Outcomes */}
              {(diploma.outcomesAr || diploma.outcomesEn) && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    {t("diplomas.outcomes")}
                  </h2>
                  <Card className="rounded-2xl p-6">
                    <div className="space-y-3">
                      {getLocalizedText(diploma.outcomesAr, diploma.outcomesEn)
                        .split("\n")
                        .filter(Boolean)
                        .map((line, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                            <p className="text-foreground leading-relaxed">
                              {line}
                            </p>
                          </div>
                        ))}
                    </div>
                  </Card>
                </div>
              )}
              {/* Career Opportunities */}
              {diploma.careerEnabled &&
                getBullets(
                  isRTL,
                  diploma.careerOpportunitiesAr,
                  diploma.careerOpportunitiesEn,
                ).length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      {isRTL ? "فرص العمل بعد التخرج" : "Career Opportunities"}
                    </h2>
                    <Card className="rounded-2xl p-6">
                      <div className="space-y-3">
                        {getBullets(
                          isRTL,
                          diploma.careerOpportunitiesAr,
                          diploma.careerOpportunitiesEn,
                        ).map((line, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                            <p className="text-foreground leading-relaxed">
                              {line}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

              {/* Diploma Advantages */}
              {diploma.advantagesEnabled &&
                getBullets(
                  isRTL,
                  diploma.diplomaAdvantagesAr,
                  diploma.diplomaAdvantagesEn,
                ).length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      {isRTL ? "مزايا الدبلوم" : "Diploma Advantages"}
                    </h2>
                    <Card className="rounded-2xl p-6">
                      <div className="space-y-3">
                        {getBullets(
                          isRTL,
                          diploma.diplomaAdvantagesAr,
                          diploma.diplomaAdvantagesEn,
                        ).map((line, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                            <p className="text-foreground leading-relaxed">
                              {line}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

              {/* Top Students Reward */}
              {diploma.topStudentsRewardEnabled &&
                getBullets(
                  isRTL,
                  diploma.topStudentsRewardAr,
                  diploma.topStudentsRewardEn,
                ).length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      {isRTL ? "مكافأة الأوائل" : "Top Students Reward"}
                    </h2>
                    <Card className="rounded-2xl p-6">
                      <div className="space-y-3">
                        {getBullets(
                          isRTL,
                          diploma.topStudentsRewardAr,
                          diploma.topStudentsRewardEn,
                        ).map((line, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                            <p className="text-foreground leading-relaxed">
                              {line}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <div className="sticky top-24">
                <Card className="rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundImage: "var(--gradient-primary)" }}
                    >
                      <Clock className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("diplomas.duration")}
                      </p>
                      <p className="text-xl font-bold text-foreground">
                        {diploma.durationMonths} {t("diplomas.months")}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full rounded-xl py-6 text-lg"
                    variant="accent"
                    style={{ boxShadow: "var(--shadow-accent)" }}
                    onClick={handleApplyWhatsApp}
                  >
                    {t("diplomas.apply")}
                  </Button>

                  <div className="mt-6 pt-6 border-t border-border">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full"
                    >
                      <Link to="/contact">{t("nav.contact")}</Link>
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
