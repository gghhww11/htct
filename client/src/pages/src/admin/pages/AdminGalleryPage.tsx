import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Trash2, Search, Upload, Loader2, Tags } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminLayout, DeleteConfirmDialog } from "@/admin/components";
import { adminApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { GalleryItem, Category } from "@/lib/types";
import { assetUrl } from "@/utils/assestUrl";

const gallerySchema = z.object({
  category: z.string().min(1, "Category is required").max(50),
  captionEn: z.string().min(1, "English caption is required").max(200),
  captionAr: z.string().min(1, "Arabic caption is required").max(200),
});

type GalleryFormData = z.infer<typeof gallerySchema>;

const categorySchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .max(50)
    .regex(
      /^[a-z0-9-]+$/i,
      "Use letters/numbers/hyphen only (e.g. computer-lab)",
    ),
  nameEn: z.string().min(1, "English name is required").max(100),
  nameAr: z.string().min(1, "Arabic name is required").max(100),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function AdminGalleryPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);

  const {
    data: gallery,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: adminApi.getGallery,
  });

  const { data: categories, isLoading: catsLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: adminApi.getCategories,
  });

  const form = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
    defaultValues: { category: "", captionEn: "", captionAr: "" },
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { key: "", nameEn: "", nameAr: "" },
  });

  const createMutation = useMutation({
    mutationFn: (data: GalleryFormData) => {
      if (!selectedFile) throw new Error("No file selected");
      return adminApi.createGalleryItem(selectedFile, {
        category: data.category, // key
        captionAr: data.captionAr,
        captionEn: data.captionEn,
      });
    },
    onSuccess: () => {
      toast.success("Gallery item added");
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      setShowAddDialog(false);
      setSelectedFile(null);
      form.reset();
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to add item"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteGalleryItem(id),
    onSuccess: () => {
      toast.success("Gallery item deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormData) =>
      adminApi.createCategory({
        key: data.key ?? "",
        nameAr: data.nameAr ?? "",
        nameEn: data.nameEn ?? "",
      }),

    onSuccess: () => {
      toast.success("Category added");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      categoryForm.reset();
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to add category",
      ),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category",
      ),
  });

  const filtered = gallery?.filter(
    (g) =>
      g.captionEn.toLowerCase().includes(search.toLowerCase()) ||
      g.captionAr.includes(search),
  );

  const categoryLabel = (c: Category) => c.nameEn;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
          <p className="text-muted-foreground">Manage photo gallery</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCategoriesDialog(true)}
          >
            <Tags className="w-4 h-4 mr-2" />
            Manage Categories
          </Button>

          <Button
            className="btn-primary-gradient"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Photo
          </Button>
        </div>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Failed to load</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      ) : filtered?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group relative aspect-square rounded-xl overflow-hidden bg-secondary"
            >
              <img
                src={assetUrl(item.thumbnailUrl ?? item.imageUrl)}
                alt=""
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-foreground/80 to-transparent">
                <p className="text-primary-foreground text-xs truncate">
                  {item.captionEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No gallery items
        </div>
      )}

      {/* Add Photo Dialog */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setSelectedFile(null);
            form.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Photo</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                createMutation.mutate(data),
              )}
              className="space-y-4"
            >
              <div
                className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile ? (
                  <p className="text-sm">{selectedFile.name}</p>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to select image
                    </p>
                  </>
                )}
              </div>

              {/* Category Dropdown (key stored, label shown) */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              catsLoading ? "Loading..." : "Select category"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {(categories ?? []).map((c) => (
                            <SelectItem key={c.id} value={c.key}>
                              {categoryLabel(c)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="captionEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caption (EN)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="captionAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caption (AR)</FormLabel>
                    <FormControl>
                      <Input {...field} dir="rtl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={!selectedFile || createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Upload
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog
        open={showCategoriesDialog}
        onOpenChange={(open) => {
          setShowCategoriesDialog(open);
          if (!open) categoryForm.reset();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>

          {/* Create Category */}
          <Form {...categoryForm}>
            <form
              onSubmit={categoryForm.handleSubmit((data) =>
                createCategoryMutation.mutate(data),
              )}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <FormField
                  control={categoryForm.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. computer-lab" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={categoryForm.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (AR)</FormLabel>
                      <FormControl>
                        <Input {...field} dir="rtl" placeholder="مثال: حاسوب" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={categoryForm.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (EN)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Example: Computer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Add Category
              </Button>
            </form>
          </Form>

          {/* Categories List */}
          <div className="mt-4 space-y-2 max-h-72 overflow-auto border rounded-md p-2">
            {catsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (categories ?? []).length ? (
              (categories ?? []).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-md p-2 hover:bg-secondary"
                >
                  <div className="text-sm">
                    <div className="font-medium">{categoryLabel(c)}</div>
                    <div className="text-muted-foreground">
                      {c.nameAr} • <span className="font-mono">{c.key}</span>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteCategoryMutation.mutate(c.id)}
                    disabled={deleteCategoryMutation.isPending}
                  >
                    {deleteCategoryMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Delete
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground p-2">
                No categories yet
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Deleting a category will delete all gallery photos under it.
          </p>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Photo"
        isLoading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
