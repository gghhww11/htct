import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { AdminLayout } from "@/admin/components";
import { adminApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { DeleteConfirmDialog } from "@/admin/components/DeleteConfirmDialog";

export default function AdminMessagesPage() {
  const queryClient = useQueryClient();
  const {
    data: messages,
    isLoading,
    error,
    refetch,
  } = useQuery({ queryKey: ["admin-messages"], queryFn: adminApi.getMessages });

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const toggleMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: number; isRead: boolean }) =>
      adminApi.updateMessageStatus(id, isRead),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] }),
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteMessage(id),
    onSuccess: () => {
      toast.success("Message deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Contact form submissions</p>
      </div>
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Failed to load</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      ) : messages?.length ? (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-card rounded-xl border p-6 ${!msg.isRead ? "border-accent" : "border-border"}`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold">{msg.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    Name: {msg.name} • E-mail: {msg.email}
                  </p>
                  {msg.phone && (
                    <p className="text-sm text-muted-foreground" dir="ltr">
                      phone number: {msg.phone}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(msg.createdAt), "MMM d, yyyy")}
                  </span>

                  {/* زر حذف */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(msg.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>

                  {/* زر قراءة/غير مقروء */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      toggleMutation.mutate({ id: msg.id, isRead: !msg.isRead })
                    }
                    title={msg.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    {msg.isRead ? (
                      <MailOpen className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4 text-accent" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-foreground whitespace-pre-line">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No messages yet
        </div>
      )}
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete message?"
        description="This will permanently delete the message."
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget !== null) deleteMutation.mutate(deleteTarget);
        }}
      />
    </AdminLayout>
  );
}
