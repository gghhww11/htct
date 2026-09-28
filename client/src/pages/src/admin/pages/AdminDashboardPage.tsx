import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Mail,
  GraduationCap,
  Users,
  Image,
} from 'lucide-react';
import { AdminLayout } from '@/admin/components';
import { adminApi } from '@/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
  });

  const statCards = [
    {
      key: 'totalMessages',
      label: 'Total Messages',
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
    {
      key: 'unreadMessages',
      label: 'Unread Messages',
      icon: Mail,
      color: 'bg-amber-500',
    },
    {
      key: 'totalDiplomas',
      label: 'Diplomas',
      icon: GraduationCap,
      color: 'bg-green-500',
    },
    {
      key: 'totalStaff',
      label: 'Staff Members',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      key: 'totalGalleryItems',
      label: 'Gallery Items',
      icon: Image,
      color: 'bg-pink-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your content.</p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-card rounded-xl">
          <p className="text-destructive mb-4">Failed to load statistics</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      ) : stats ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {statCards.map((card, index) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-card rounded-xl p-6 shadow-sm border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {stats[card.key as keyof typeof stats]}
              </p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </motion.div>
          ))}
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto py-4 justify-start" asChild>
            <a href="/admin/diplomas">
              <GraduationCap className="w-5 h-5 mr-3 text-primary" />
              <span>Manage Diplomas</span>
            </a>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start" asChild>
            <a href="/admin/staff">
              <Users className="w-5 h-5 mr-3 text-primary" />
              <span>Manage Staff</span>
            </a>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start" asChild>
            <a href="/admin/gallery">
              <Image className="w-5 h-5 mr-3 text-primary" />
              <span>Manage Gallery</span>
            </a>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start" asChild>
            <a href="/admin/messages">
              <MessageSquare className="w-5 h-5 mr-3 text-primary" />
              <span>View Messages</span>
            </a>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
