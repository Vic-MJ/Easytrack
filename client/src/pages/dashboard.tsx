import { Layout } from "@/components/layout/layout";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Early return if no user is authenticated
  if (!user) {
    return null; // ProtectedRoute will handle the redirect
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tablero</h2>
          <p className="text-gray-600">Gestión de reposiciones y reprocesos en tiempo real</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <RecentActivity />
      </div>
    </Layout>
  );
}
