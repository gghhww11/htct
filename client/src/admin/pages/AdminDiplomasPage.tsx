import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Eye, EyeOff } from "lucide-react";
import { AdminLayout, DeleteConfirmDialog } from "@/admin/components";
import { adminApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Diploma } from "@/lib/types";
import { assetUrl } from "@/utils/assestUrl";

export default function AdminDiplomasPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Diploma | null>(null);

  const {
    data: diplomas,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-diplomas"],
    queryFn: adminApi.getDiplomas,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteDiploma(id),
    onSuccess: () => {
      toast.success("Diploma deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-diplomas"] });
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete diploma",
      );
    },
  });

  const filteredDiplomas = diplomas?.filter(
    (d) =>
      d.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      d.titleAr.includes(search),
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Diplomas</h1>
          <p className="text-muted-foreground">
            Manage your educational programs
          </p>
        </div>
        <Button asChild className="btn-primary-gradient">
          <Link to="/admin/diplomas/new/edit">
            <Plus className="w-4 h-4 mr-2" />
            Add Diploma
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search diplomas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-destructive mb-4">Failed to load diplomas</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        ) : filteredDiplomas && filteredDiplomas.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title (EN)</TableHead>
                <TableHead>Title (AR)</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiplomas.map((diploma, index) => (
                <motion.tr
                  key={diploma.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border last:border-0"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {diploma.thumbnailUrl ? (
                        <img
                          src={assetUrl(diploma.thumbnailUrl)}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            {diploma.titleEn.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="font-medium">{diploma.titleEn}</span>
                    </div>
                  </TableCell>
                  <TableCell dir="rtl">{diploma.titleAr}</TableCell>
                  <TableCell>{diploma.durationMonths} months</TableCell>
                  <TableCell>
                    {diploma.isActive ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                        <Eye className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
                        <EyeOff className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/diplomas/${diploma.id}/edit`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(diploma)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              {search ? "No diplomas match your search" : "No diplomas yet"}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Diploma"
        description={`Are you sure you want to delete "${deleteTarget?.titleEn}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
