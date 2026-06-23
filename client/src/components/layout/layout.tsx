import { useState, ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CustomSidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { RepositionForm } from "@/components/repositions/RepositionForm";
import { useWebSocket } from "@/lib/websocket";
import { useAuth } from "@/hooks/use-auth";
import { ReportsPanel } from "../reports/ReportsPanel";
import { Redirect } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isLoading, error } = useAuth();
  const [showCreateReposition, setShowCreateReposition] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReports, setShowReports] = useState(false);

  useWebSocket();

  const canCreateRepositions = user?.area === 'calidad' || user?.area === 'admin' || user?.area === 'maquilas';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('[LAYOUT] Authentication error:', error);
  }

  if (!user) {
    console.log('[LAYOUT] No user found, redirecting to auth');
  }

  if (error || !user) {
    return <Redirect to="/auth" />;
  }

  console.log('[LAYOUT] User authenticated:', user.username, user.area);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[var(--jasana-content-bg)]">
        <CustomSidebar
          onShowNotifications={() => setShowNotifications(true)}
          onCreateReposition={() => setShowCreateReposition(true)}
        />

        <SidebarInset className="flex-1 flex flex-col">
          <TopBar onShowNotifications={() => setShowNotifications(true)} />
          <main className="flex-1 p-6 overflow-y-auto bg-[var(--jasana-content-bg)]">
            {children}
          </main>
        </SidebarInset>

        {showCreateReposition && canCreateRepositions && (
          <RepositionForm onClose={() => setShowCreateReposition(false)} />
        )}

        <NotificationsPanel
          open={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
        <ReportsPanel
          open={showReports}
          onClose={() => setShowReports(false)}
        />
      </div>
    </SidebarProvider>
  );
}