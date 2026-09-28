import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, ArrowRight, Search } from "lucide-react";

import { PublicLayout } from "@/components/layout";
import { publicApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

import type { Diploma } from "@/lib/types";
import { assetUrl } from "@/utils/assestUrl";

export default function DiplomasPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const [q, setQ] = useState("");

  const {
    data: diplomas,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["diplomas"],
    queryFn: publicApi.getDiplomas,
  });

  const getLocalizedText = useCallback(
    (arText: string, enText: string) => (isRTL ? arText : enText),
    [isRTL],
  );

  const filtered = useMemo(() => {
    if (!diplomas) return [];

    const query = q.trim().toLowerCase();

    if (!query) return diplomas;

    return diplomas.filter((d) => {
      const title = getLocalizedText(d.titleAr, d.titleEn).toLowerCase();

      const desc = getLocalizedText(
        d.descriptionAr,
        d.descriptionEn,
      ).toLowerCase();

      return title.includes(query) || desc.includes(query);
    });
  }, [diplomas, q, getLocalizedText]);

  return (
    <PublicLayout>
      {/* Header */}
      <section
        className="text-primary-foreground py-16"
        style={{
          backgroundImage: "var(--gradient-hero)",
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {t("diplomas.title")}
            </h1>

            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              {t("diplomas.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              {isLoading
                ? isRTL
                  ? "جاري التحميل…"
                  : "Loading…"
                : error
                  ? isRTL
                    ? "تعذر تحميل الدبلومات."
                    : "Failed to load diplomas."
                  : isRTL
                    ? `عدد الدبلومات: ${filtered.length}`
                    : `Diplomas: ${filtered.length}`}
            </div>

            <div className="relative w-full md:w-[360px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={isRTL ? "ابحث عن دبلوم…" : "Search a diploma…"}
                className="w-full h-11 rounded-xl border border-input bg-background px-10 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden rounded-2xl">
                  <Skeleton className="h-48 w-full" />

                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />

                    <div className="pt-2">
                      <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            /* Error */
            <div className="text-center py-14">
              <p className="text-destructive mb-4">{t("common.error")}</p>

              <Button
                onClick={() => refetch()}
                variant="accent"
                className="rounded-xl"
              >
                {t("common.retry")}
              </Button>
            </div>
          ) : filtered.length > 0 ? (
            /* Diplomas Grid */
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((diploma: Diploma, index: number) => (
                <motion.div
                  key={diploma.id}
                  initial={{
                    opacity: 0,
                    y: 14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.06,
                  }}
                >
                  <Card className="group h-full overflow-hidden rounded-2xl hover:shadow-lg transition-shadow">
                    {/* Image */}
                    <div className="relative h-48 bg-secondary overflow-hidden">
                      {diploma.imageUrl ? (
                        <img
                          src={assetUrl(diploma.imageUrl)}
                          alt={getLocalizedText(
                            diploma.titleAr,
                            diploma.titleEn,
                          )}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            backgroundImage: "var(--gradient-primary)",
                          }}
                        >
                          <span className="text-4xl font-bold text-primary-foreground/30">
                            {getLocalizedText(
                              diploma.titleAr,
                              diploma.titleEn,
                            ).charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Subtle Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
                        {getLocalizedText(diploma.titleAr, diploma.titleEn)}
                      </h3>

                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                        {getLocalizedText(
                          diploma.descriptionAr,
                          diploma.descriptionEn,
                        )}
                      </p>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />

                          <span>
                            {diploma.durationMonths} {t("diplomas.months")}
                          </span>
                        </div>

                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-accent"
                        >
                          <Link to={`/diplomas/${diploma.slug}`}>
                            {t("diplomas.viewDetails")}

                            <Arrow className="w-4 h-4 ms-1" />
                          </Link>
                        </Button>
                      </div>

                      <div className="mt-5">
                        <Button
                          asChild
                          variant="outline"
                          className="w-full rounded-full"
                        >
                          <Link to={`/diplomas/${diploma.slug}`}>
                            {isRTL ? "عرض التفاصيل" : "View details"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            /* No Data */
            <div className="text-center py-14">
              <p className="text-muted-foreground">{t("common.noData")}</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
