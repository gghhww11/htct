import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { PublicLayout } from "@/components/layout";
import { publicApi } from "@/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type { Staff } from "@/lib/types";
import { assetUrl } from "@/utils/assestUrl";

export default function StaffPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const {
    data: staff,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["staff"],
    queryFn: publicApi.getStaff,
  });

  const staffList = staff ?? [];

  const admins = staffList.filter((m) => m.role === "MANAGER");

  const teachers = staffList.filter((m) => m.role === "TEACHER");

  const getLocalizedText = (arText: string, enText: string) =>
    isRTL ? arText : enText;

  const roleLabel = (role: "MANAGER" | "TEACHER") => {
    if (isRTL) {
      return role === "MANAGER" ? "إداري" : "أستاذ";
    }

    return role === "MANAGER" ? "Administrator" : "Teacher";
  };

  const StaffCard = (member: Staff, index: number) => (
    <motion.div
      key={member.id}
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
      <Card className="group rounded-2xl overflow-hidden text-center">
        <div className="relative h-64 bg-secondary overflow-hidden">
          {/* الصورة غير إلزامية */}
          {member.imageUrl ? (
            <img
              src={assetUrl(member.imageUrl)}
              alt={getLocalizedText(member.nameAr, member.nameEn)}
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
              <span className="text-6xl font-bold text-primary-foreground/30">
                {getLocalizedText(member.nameAr, member.nameEn).charAt(0)}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {getLocalizedText(member.nameAr, member.nameEn)}
          </h3>

          <p className="text-accent text-sm font-medium">
            {roleLabel(member.role)}
          </p>

          {(member.bioAr || member.bioEn) && (
            <p className="text-muted-foreground text-sm mt-3 line-clamp-2">
              {getLocalizedText(member.bioAr || "", member.bioEn || "")}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );

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
              {t("staff.title")}
            </h1>

            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              {t("staff.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Staff */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="rounded-2xl overflow-hidden">
                  <Skeleton className="h-64 w-full" />

                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{t("common.error")}</p>

              <Button
                onClick={() => refetch()}
                variant="accent"
                className="rounded-xl"
              >
                {t("common.retry")}
              </Button>
            </div>
          ) : staffList.length > 0 ? (
            <div className="space-y-14">
              {/* الإداريين */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {isRTL ? "الإداريين" : "Administrators"}
                </h2>

                {admins.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {admins.map((m, i) => StaffCard(m, i))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {isRTL ? "لا يوجد إداريين حاليًا" : "No administrators yet"}
                  </p>
                )}
              </section>

              {/* فاصل */}
              <div className="relative">
                <div className="h-px w-full bg-border" />
              </div>

              {/* الأساتذة */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {isRTL ? "الأساتذة" : "Teachers"}
                </h2>

                {teachers.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {teachers.map((m, i) => StaffCard(m, i))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {isRTL ? "لا يوجد أساتذة حاليًا" : "No teachers yet"}
                  </p>
                )}
              </section>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("common.noData")}</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-14 text-center">
            <div
              className="rounded-2xl p-8 text-primary-foreground max-w-3xl mx-auto"
              style={{
                backgroundImage: "var(--gradient-primary)",
              }}
            >
              <h3 className="text-2xl font-bold mb-3">
                {isRTL
                  ? "هل لديك سؤال حول برامجنا؟"
                  : "Have questions about our programs?"}
              </h3>

              <p className="text-primary-foreground/80 mb-6">
                {isRTL
                  ? "تواصل معنا وسنساعدك في اختيار الدبلوم المناسب."
                  : "Contact us and we’ll help you choose the right diploma."}
              </p>

              <Button
                asChild
                variant="accent"
                className="rounded-full px-8"
                style={{
                  boxShadow: "var(--shadow-accent)",
                }}
              >
                <Link to="/contact">{isRTL ? "تواصل معنا" : "Contact Us"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
