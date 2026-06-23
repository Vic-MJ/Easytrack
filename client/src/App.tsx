import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { useWebSocket } from "@/lib/websocket";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect, Component, ReactNode } from "react";
import { NotificationService } from "@/lib/notifications";
import { apiRequest } from "./lib/queryClient";

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Algo salió mal
            </h2>
            <p className="text-gray-600 mb-4">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Pages
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import AdminPage from "@/pages/admin-page";
import NotFound from "@/pages/not-found";
import RepositionsPage from "@/pages/repositions-page";
import HistoryPage from "@/pages/history-page";
import AlmacenPage from "@/pages/almacen-page";
import AgendaPage from "@/pages/agenda-page";
import MetricsPage from "@/pages/metrics-page";
import UsersPage from "@/pages/users-page";
import MaintenanceScreen from "@/components/maintenance/MaintenanceScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = error.message as string;
          if (errorMessage.includes('401') || errorMessage.includes('403')) {
            return false;
          }
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { onMessage } = useWebSocket();
  const { user, isLoading: authLoading } = useAuth();
  const [isMaintenance, setIsMaintenance] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Cargar estado inicial
    const fetchMaintenanceMode = async () => {
      try {
        const res = await apiRequest('GET', '/api/settings/maintenance_mode');
        const data = await res.json();
        if (isMounted && data) {
          setIsMaintenance(data.value === 'true');
        }
      } catch (err) {
        console.error('Error cargando modo mantenimiento:', err);
        if (isMounted) setIsMaintenance(false);
      }
    };

    fetchMaintenanceMode();

    // Escuchar cambios por WebSocket
    const unsubscribe = onMessage((data: any) => {
      if (isMounted && data.type === 'maintenance') {
        console.log('Cambio de modo mantenimiento recibido:', data.enabled);
        setIsMaintenance(data.enabled);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [onMessage]);

  useEffect(() => {
    try {
      NotificationService.getInstance();
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }, []);

  // Mientras carga cualquiera de los estados fundamentales, esperamos
  if (authLoading || isMaintenance === null) {
    return null;
  }

  // Si estamos en mantenimiento y NO es admin, bloqueo total
  if (isMaintenance && user?.area !== 'admin') {
    return <MaintenanceScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/maintenance" component={MaintenanceScreen} />
        <Route path="/">
          {() => {
            if (user) {
              window.history.replaceState({}, '', '/dashboard');
            } else {
              window.history.replaceState({}, '', '/auth');
            }
            return null;
          }}
        </Route>
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/admin" component={AdminPage} />
        <ProtectedRoute path="/repositions" component={RepositionsPage} />
        <ProtectedRoute path="/history" component={HistoryPage} />
        <ProtectedRoute path="/almacen" component={AlmacenPage} />
        <ProtectedRoute path="/agenda" component={AgendaPage} />
        <ProtectedRoute path="/metrics" component={MetricsPage} />
        <ProtectedRoute path="/users" component={UsersPage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;