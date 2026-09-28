import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { AdminLayout } from "@/admin/components";
import { adminApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { assetUrl } from "@/utils/assestUrl";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const diplomaSchema = z.object({
  titleEn: z.string().min(1, "English title is required").max(200),
  titleAr: z.string().min(1, "Arabic title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only",
    ),
  descriptionEn: z.string().min(1, "English description is required").max(2000),
  descriptionAr: z.string().min(1, "Arabic description is required").max(2000),
  durationMonths: z.coerce
    .number()
    .min(1, "Duration must be at least 1 month")
    .max(48),
  requirementsEn: z.string().max(2000).optional(),
  requirementsAr: z.string().max(2000).optional(),
  curriculumEn: z.string().max(5000).optional(),
  curriculumAr: z.string().max(5000).optional(),
  isActive: z.boolean(),

  careerEnabled: z.boolean().default(false),
  careerOpportunitiesEn: z
    .array(z.string().min(1).max(200))
    .max(50)
    .default([]),
  careerOpportunitiesAr: z
    .array(z.string().min(1).max(200))
    .max(50)
    .default([]),

  advantagesEnabled: z.boolean().default(false),
  diplomaAdvantagesEn: z.array(z.string().min(1).max(200)).max(50).default([]),
  diplomaAdvantagesAr: z.array(z.string().min(1).max(200)).max(50).default([]),

  topStudentsRewardEnabled: z.boolean().default(false),
  topStudentsRewardEn: z.array(z.string().min(1).max(200)).max(50).default([]),
  topStudentsRewardAr: z.array(z.string().min(1).max(200)).max(50).default([]),
});

type DiplomaFormData = z.infer<typeof diplomaSchema>;

function BulletListEditor({
  label,
  items,
  onChange,
  dir,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  dir?: "rtl" | "ltr";
}) {
  const add = () => onChange([...(items || []), ""]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx: number, val: string) =>
    onChange(items.map((x, i) => (i === idx ? val : x)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          + Add
        </Button>
      </div>

      {items?.length ? (
        <div className="space-y-2">
          {items.map((val, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={val}
                onChange={(e) => update(idx, e.target.value)}
                dir={dir}
                placeholder={
                  dir === "rtl" ? "اكتب نقطة..." : "Type a bullet..."
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(idx)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No items yet.</p>
      )}
    </div>
  );
}

export default function AdminDiplomaEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === "new";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: diploma, isLoading: loadingDiploma } = useQuery({
    queryKey: ["admin-diploma", id],
    queryFn: () =>
      adminApi
        .getDiplomas()
        .then((list) => list.find((d) => d.id === Number(id))),
    enabled: !isNew && !!id,
  });

  const form = useForm<DiplomaFormData>({
    resolver: zodResolver(diplomaSchema),
    defaultValues: {
      titleEn: "",
      titleAr: "",
      slug: "",
      descriptionEn: "",
      descriptionAr: "",
      durationMonths: 6,
      requirementsEn: "",
      requirementsAr: "",
      curriculumEn: "",
      curriculumAr: "",
      isActive: true,

      careerEnabled: false,
      careerOpportunitiesEn: [],
      careerOpportunitiesAr: [],

      advantagesEnabled: false,
      diplomaAdvantagesEn: [],
      diplomaAdvantagesAr: [],

      topStudentsRewardEnabled: false,
      topStudentsRewardEn: [],
      topStudentsRewardAr: [],
    },
    values: diploma
      ? {
          titleEn: diploma.titleEn,
          titleAr: diploma.titleAr,
          slug: diploma.slug,
          descriptionEn: diploma.descriptionEn,
          descriptionAr: diploma.descriptionAr,
          durationMonths: diploma.durationMonths,
          requirementsEn: diploma.requirementsEn || "",
          requirementsAr: diploma.requirementsAr || "",
          curriculumEn: diploma.curriculumEn || "",
          curriculumAr: diploma.curriculumAr || "",
          isActive: diploma.isActive,

          careerEnabled: (diploma as any).careerEnabled ?? false,
          careerOpportunitiesEn: (diploma as any).careerOpportunitiesEn ?? [],
          careerOpportunitiesAr: (diploma as any).careerOpportunitiesAr ?? [],

          advantagesEnabled: (diploma as any).advantagesEnabled ?? false,
          diplomaAdvantagesEn: (diploma as any).diplomaAdvantagesEn ?? [],
          diplomaAdvantagesAr: (diploma as any).diplomaAdvantagesAr ?? [],

          topStudentsRewardEnabled:
            (diploma as any).topStudentsRewardEnabled ?? false,
          topStudentsRewardEn: (diploma as any).topStudentsRewardEn ?? [],
          topStudentsRewardAr: (diploma as any).topStudentsRewardAr ?? [],
        }
      : undefined,
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createDiploma,
    onSuccess: (data) => {
      toast.success("Diploma created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-diplomas"] });
      navigate(`/admin/diplomas/${data.id}/edit`);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to create diploma",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<DiplomaFormData>) =>
      adminApi.updateDiploma(Number(id), data),
    onSuccess: () => {
      toast.success("Diploma updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-diplomas"] });
      queryClient.invalidateQueries({ queryKey: ["admin-diploma", id] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update diploma",
      );
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => adminApi.uploadDiplomaImage(Number(id), file),
    onSuccess: () => {
      toast.success("Image uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-diplomas"] });
      queryClient.invalidateQueries({ queryKey: ["admin-diploma", id] });
      setImagePreview(null);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image",
      );
    },
  });

  const onSubmit = (data: DiplomaFormData) => {
    if (isNew) createMutation.mutate(data);
    else updateMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  if (!isNew && loadingDiploma) {
    return (
      <AdminLayout>
        <div className="max-w-4xl space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/diplomas")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Diplomas
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? "Create Diploma" : "Edit Diploma"}
          </h1>
        </div>

        {/* Image Upload (only for existing) */}
        {!isNew && (
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Diploma Image</h2>
            <div className="flex items-start gap-6">
              <div className="w-40 h-28 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : diploma?.imageUrl ? (
                  <img
                    src={assetUrl(diploma.imageUrl)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  {imagePreview && (
                    <>
                      <Button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploadMutation.isPending}
                      >
                        {uploadMutation.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Upload
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setImagePreview(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Recommended: 1200x800 pixels, max 5MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-card rounded-xl border border-border p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="titleEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (English)</FormLabel>
                      <FormControl>
                        <Input id={field.name} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="titleAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Arabic)</FormLabel>
                      <FormControl>
                        <Input id={field.name} {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="diploma-name" />
                      </FormControl>
                      <FormDescription>
                        Used in URL: /diplomas/your-slug
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (months)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={1} max={48} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Descriptions */}
              <FormField
                control={form.control}
                name="descriptionEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (English)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptionAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Arabic)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} dir="rtl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Requirements */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="requirementsEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements (English)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requirementsAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements (Arabic)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Curriculum */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="curriculumEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Curriculum (English)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="curriculumAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Curriculum (Arabic)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Career Opportunities */}
              <FormField
                control={form.control}
                name="careerEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <FormLabel className="text-base">
                        Career Opportunities
                      </FormLabel>
                      <FormDescription>فرص العمل بعد التخرج</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("careerEnabled") && (
                <div className="grid md:grid-cols-2 gap-6 rounded-lg border border-border p-4">
                  <FormField
                    control={form.control}
                    name="careerOpportunitiesEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <BulletListEditor
                            label="Career Opportunities (English)"
                            items={field.value || []}
                            onChange={field.onChange}
                            dir="ltr"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="careerOpportunitiesAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <BulletListEditor
                            label="فرص العمل بعد التخرج (عربي)"
                            items={field.value || []}
                            onChange={field.onChange}
                            dir="rtl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Diploma Advantages */}
              <FormField
                control={form.control}
                name="advantagesEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <FormLabel className="text-base">
                        Diploma Advantages
                      </FormLabel>
                      <FormDescription>مزايا الدبلوم</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("advantagesEnabled") && (
                <div className="grid md:grid-cols-2 gap-6 rounded-lg border border-border p-4">
                  <FormField
                    control={form.control}
                    name="diplomaAdvantagesEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <BulletListEditor
                            label="Diploma Advantages (English)"
                            items={field.value || []}
                            onChange={field.onChange}
                            dir="ltr"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diplomaAdvantagesAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <BulletListEditor
                            label="مزايا الدبلوم (عربي)"
                            items={field.value || []}
                            onChange={field.onChange}
                            dir="rtl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Top Students Reward */}
              <FormField
                control={form.control}
                name="topStudentsRewardEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <FormLabel className="text-base">
                        Top Students Reward
                      </FormLabel>
                      <FormDescription>مكافأة الأوائل</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("topStudentsRewardEnabled") && (
                <div className="grid md:grid-cols-2 gap-6 rounded-lg border border-border p-4">
                  <FormField
                    control={form.control}
                    name="topStudentsRewardEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <BulletListEditor
                            label="Top Students Reward (English)"
                            items={field.value || []}
                            onChange={field.onChange}
                            dir="ltr"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="topStudentsRewardAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <BulletListEditor
                            label="مكافأة الأوائل (عربي)"
                            items={field.value || []}
                            onChange={field.onChange}
                            dir="rtl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Show this diploma on the public website
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="btn-primary-gradient"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isNew ? "Create Diploma" : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/diplomas")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
}
