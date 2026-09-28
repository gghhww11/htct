import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
import type { Staff } from "@/lib/types";
import { assetUrl } from "@/utils/assestUrl";

export default function AdminStaffPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);

  const {
    data: staff,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: adminApi.getStaff,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteStaff(id),
    onSuccess: () => {
      toast.success("Staff member deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete staff member",
      );
    },
  });

  const filteredStaff = staff?.filter(
    (s) =>
      s.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      s.nameAr.includes(search),
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <Button asChild className="btn-primary-gradient">
          <Link to="/admin/staff/new/edit">
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
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
            <p className="text-destructive mb-4">Failed to load staff</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        ) : filteredStaff && filteredStaff.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name (EN)</TableHead>
                <TableHead>Name (AR)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member, index) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border last:border-0"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {member.thumbnailUrl || member.imageUrl ? (
                        <img
                          src={assetUrl(member.thumbnailUrl ?? member.imageUrl)}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            const fallback = member.imageUrl
                              ? assetUrl(member.imageUrl)
                              : "";
                            if (fallback && img.src !== fallback)
                              img.src = fallback;
                            else img.remove();
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            {member.nameEn.charAt(0)}
                          </span>
                        </div>
                      )}

                      <span className="font-medium">{member.nameEn}</span>
                    </div>
                  </TableCell>
                  <TableCell dir="rtl">{member.nameAr}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/staff/${member.id}/edit`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(member)}
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
              {search ? "No staff match your search" : "No staff members yet"}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Staff Member"
        description={`Are you sure you want to delete "${deleteTarget?.nameEn}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
