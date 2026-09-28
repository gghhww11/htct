import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import { PublicLayout } from "@/components/layout";
import { publicApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

import type { GalleryItem, Category } from "@/lib/types";
import { assetUrl } from "@/utils/assestUrl";

export default function GalleryPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const {
    data: gallery,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["gallery"],
    queryFn: publicApi.getGallery,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["public-categories"],
    queryFn: publicApi.getCategories,
  });

  const getLocalizedCaption = (item: GalleryItem) =>
    isRTL ? item.captionAr : item.captionEn;

  const categoryLabelByKey = useMemo(() => {
    const map = new Map<string, string>();

    (categoriesData ?? []).forEach((c: Category) => {
      map.set(c.key, isRTL ? c.nameAr : c.nameEn);
    });

    return map;
  }, [categoriesData, isRTL]);

  const displayCategory = useCallback(
    (key: string) => categoryLabelByKey.get(key) ?? key,
    [categoryLabelByKey],
  );

  // Build filter list from gallery keys,
  // but display labels from categories table
  const categories = useMemo(() => {
    const keys = gallery
      ? Array.from(new Set(gallery.map((item) => item.category)))
      : [];

    return ["all", ...keys];
  }, [gallery]);

  const filteredGallery = useMemo(() => {
    return gallery?.filter(
      (item) =>
        selectedCategory === "all" || item.category === selectedCategory,
    );
  }, [gallery, selectedCategory]);

  const currentIndex = selectedImage
    ? (filteredGallery?.findIndex((item) => item.id === selectedImage.id) ?? -1)
    : -1;

  const goToPrevious = useCallback(() => {
    if (!filteredGallery || currentIndex <= 0) return;

    setSelectedImage(filteredGallery[currentIndex - 1]);
  }, [filteredGallery, currentIndex]);

  const goToNext = useCallback(() => {
    if (!filteredGallery || currentIndex >= filteredGallery.length - 1) {
      return;
    }

    setSelectedImage(filteredGallery[currentIndex + 1]);
  }, [filteredGallery, currentIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedImage(null);
      }

      if (e.key === "ArrowLeft") {
        (isRTL ? goToNext : goToPrevious)();
      }

      if (e.key === "ArrowRight") {
        (isRTL ? goToPrevious : goToNext)();
      }
    },
    [goToNext, goToPrevious, isRTL],
  );

  const canGoPrev = currentIndex > 0;

  const canGoNext =
    !!filteredGallery && currentIndex < filteredGallery.length - 1;

  // RTL-aware positioning
  const prevBtnPos = isRTL ? "right-4" : "left-4";
  const nextBtnPos = isRTL ? "left-4" : "right-4";
  const closeBtnPos = isRTL ? "left-4" : "right-4";

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
              {t("gallery.title")}
            </h1>

            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              {t("gallery.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-secondary/50 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const active = selectedCategory === category;

              const label =
                category === "all"
                  ? t("gallery.all")
                  : displayCategory(category);

              return (
                <Button
                  key={category}
                  variant={active ? "accent" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                  style={
                    active
                      ? {
                          boxShadow: "var(--shadow-accent)",
                        }
                      : undefined
                  }
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
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
          ) : filteredGallery && filteredGallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGallery.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.04,
                  }}
                  onClick={() => setSelectedImage(item)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {/* Thumbnail is used here because
                        this is a small gallery card */}
                  <img
                    src={assetUrl(item.thumbnailUrl ?? item.imageUrl)}
                    alt={getLocalizedCaption(item)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Overlay caption */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-sm font-medium line-clamp-2">
                        {getLocalizedCaption(item)}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("common.noData")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 bg-foreground/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="dialog"
            aria-modal="true"
            autoFocus
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className={`absolute top-4 ${closeBtnPos} z-10 p-2 rounded-full bg-background/15 text-white hover:bg-background/25 transition-colors`}
              aria-label={t("common.close")}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous */}
            {canGoPrev && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className={`absolute ${prevBtnPos} top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/15 text-white hover:bg-background/25 transition-colors`}
                aria-label={isRTL ? "التالي" : "Previous"}
              >
                {isRTL ? (
                  <ChevronRight className="w-8 h-8" />
                ) : (
                  <ChevronLeft className="w-8 h-8" />
                )}
              </button>
            )}

            {/* Next */}
            {canGoNext && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className={`absolute ${nextBtnPos} top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/15 text-white hover:bg-background/25 transition-colors`}
                aria-label={isRTL ? "السابق" : "Next"}
              >
                {isRTL ? (
                  <ChevronLeft className="w-8 h-8" />
                ) : (
                  <ChevronRight className="w-8 h-8" />
                )}
              </button>
            )}

            {/* Modal Card */}
            <motion.div
              key={selectedImage.id}
              initial={{
                scale: 0.96,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.96,
                opacity: 0,
              }}
              className="w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="rounded-2xl overflow-hidden bg-background/95">
                <div className="p-4 md:p-5 border-b border-border flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground line-clamp-1">
                      {getLocalizedCaption(selectedImage)}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {displayCategory(selectedImage.category)}
                    </p>
                  </div>
                </div>

                {/* Full-resolution image.
                    Do NOT use thumbnailUrl here. */}
                <div className="bg-black/5 flex items-center justify-center">
                  <img
                    src={assetUrl(selectedImage.imageUrl)}
                    alt={getLocalizedCaption(selectedImage)}
                    className="w-full h-auto max-h-[90vh] object-contain"
                  />
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PublicLayout>
  );
}
