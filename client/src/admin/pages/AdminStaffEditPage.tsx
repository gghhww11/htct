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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import { assetUrl } from "@/utils/assestUrl";

const staffSchema = z.object({
  nameEn: z.string().min(1, "English name is required").max(100),
  nameAr: z.string().min(1, "Arabic name is required").max(100),

  role: z.enum(["MANAGER", "TEACHER"], {
    required_error: "Role is required",
  }),

  bioEn: z.string().min(1, "Bio (English) is required").max(1000),
  bioAr: z.string().min(1, "Bio (Arabic) is required").max(1000),

  expertiseTags: z.array(z.string()).optional().default([]),
});

type StaffFormData = z.infer<typeof staffSchema>;

export default function AdminStaffEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === "new";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: staff, isLoading: loadingStaff } = useQuery({
    queryKey: ["admin-staff-member", id],
    queryFn: () =>
      adminApi.getStaff().then((list) => list.find((s) => s.id === Number(id))),
    enabled: !isNew && !!id,
  });

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      nameEn: "",
      nameAr: "",
      role: "TEACHER",
      bioEn: "",
      bioAr: "",
      expertiseTags: [],
    },
    values: staff
      ? {
          nameEn: staff.nameEn,
          nameAr: staff.nameAr,
          role: staff.role,
          bioEn: staff.bioEn,
          bioAr: staff.bioAr,
          expertiseTags: staff.expertiseTags ?? [],
        }
      : undefined,
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createStaff,
    onSuccess: (data) => {
      toast.success("Staff member created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      navigate(`/admin/staff/${data.id}/edit`);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to create staff member",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<StaffFormData>) =>
      adminApi.updateStaff(Number(id), data),
    onSuccess: () => {
      toast.success("Staff member updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      queryClient.invalidateQueries({ queryKey: ["admin-staff-member", id] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update staff member",
      );
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => adminApi.uploadStaffImage(Number(id), file),
    onSuccess: () => {
      toast.success("Image uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      queryClient.invalidateQueries({ queryKey: ["admin-staff-member", id] });
      setImagePreview(null);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image",
      );
    },
  });

  const onSubmit = (data: StaffFormData) => {
    if (isNew) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  if (!isNew && loadingStaff) {
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
            onClick={() => navigate("/admin/staff")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Staff
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? "Add Staff Member" : "Edit Staff Member"}
          </h1>
        </div>

        {/* Image Upload (only for existing) */}
        {!isNew && (
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>

            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : staff?.imageUrl ? (
                  <img
                    src={assetUrl(staff.imageUrl)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">
                    {staff?.nameEn?.charAt(0) || "?"}
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
                          URL.revokeObjectURL(imagePreview);
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
                  Recommended: 400x400 pixels, max 2MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-card rounded-xl border border-border p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (English)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (Arabic)</FormLabel>
                      <FormControl>
                        <Input {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MANAGER">
                              مدير / Manager
                            </SelectItem>
                            <SelectItem value="TEACHER">
                              أستاذ / Teacher
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="bioEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (English)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bioAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (Arabic)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  {isNew ? "Add Staff Member" : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/staff")}
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
