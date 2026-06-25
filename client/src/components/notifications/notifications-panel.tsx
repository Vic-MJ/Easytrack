import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Bell,
  Package,
  RefreshCw,
  Plus,
  X,
  XCircle,
  Trash2,
  BellRing,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Inbox,
  Calendar,
  Layers,
  Check
} from "lucide-react";
import { type RepositionTransfer } from "@shared/schema";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, isThisWeek, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { NotificationPermission } from "./notification-permission";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

// Helper to fix timezone issues (Server sending UTC without Z)
const fixDate = (date: string | Date | undefined) => {
  if (!date) return new Date();
  if (typeof date === 'string') {
    // If it doesn't end in Z and looks like an ISO string, append Z to treat as UTC
    if (!date.endsWith('Z') && !date.includes('+') && date.includes('T')) {
      return new Date(`${date}Z`);
    }
    return new Date(date);
  }
  return date;
};

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [expandedNotifications, setExpandedNotifications] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'transfers' | 'system'>('all');

  const { data: pendingTransfers = [] } = useQuery<RepositionTransfer[]>({
    queryKey: ["transferencias-pendientes-reposicion"],
    queryFn: async () => {
      const res = await fetch("/api/repositions/transfers/pending");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: open,
  });

  const { data: repositionNotifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: open,
    refetchInterval: 5000,
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/notifications");
      const allNotifications = await res.json();
      return allNotifications.filter((n: any) =>
        !n.read && (
          n.type?.includes('reposition') ||
          n.type?.includes('completion') ||
          n.type === 'new_reposition' ||
          n.type === 'reposition_transfer' ||
          n.type === 'reposition_approved' ||
          n.type === 'reposition_rejected' ||
          n.type === 'reposition_completed' ||
          n.type === 'reposition_deleted' ||
          n.type === 'completion_approval_needed' ||
          n.type === 'partial_transfer_warning'
        )
      );
    },
  });

  // --- Mutations ---
  const acceptTransferMutation = useMutation({
    mutationFn: async (transferId: number) => {
      const res = await apiRequest("POST", `/api/repositions/transfers/${transferId}/process`, { action: "accepted" });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transferencia Exitosa",
        description: "El inventario ha sido actualizado.",
        className: "bg-green-50 border-green-200 dark:bg-green-900/50 dark:border-green-800",
      });
      queryClient.invalidateQueries({ queryKey: ["transferencias-pendientes-reposicion"] });
      queryClient.invalidateQueries({ queryKey: ["repositions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectTransferMutation = useMutation({
    mutationFn: async (transferId: number) => {
      const res = await apiRequest("POST", `/api/repositions/transfers/${transferId}/process`, { action: "rejected" });
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Transferencia Rechazada", description: "Se notificó al solicitante." });
      queryClient.invalidateQueries({ queryKey: ["transferencias-pendientes-reposicion"] });
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await apiRequest("POST", `/api/repositions/${notificationId}/read`);
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const clearAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/notifications/clear-all");
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Todo limpio", description: "Notificaciones marcadas como leídas." });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // --- Helpers ---
  const getAreaDisplayName = (area: string) => {
    const names: Record<string, string> = {
      corte: "Corte", bordado: "Bordado", ensamble: "Ensamble",
      plancha: "Plancha/Empaque", calidad: "Calidad", envios: "Envíos", maquilas: "Maquilas",
      admin: "Administración", diseño: "Diseño",
    };
    return names[area] || area;
  };

  const getStyle = (type: string) => {
    switch (type) {
      case 'transfer':
      case 'reposition_transfer':
        return {
          icon: <ArrowRight className="w-5 h-5 text-white" />,
          gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
          shadow: "shadow-blue-200 dark:shadow-blue-900/20",
          border: "hover:border-blue-200 dark:hover:border-blue-800"
        };
      case 'order_completed':
      case 'reposition_approved':
      case 'reposition_completed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-white" />,
          gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
          shadow: "shadow-emerald-200 dark:shadow-emerald-900/20",
          border: "hover:border-emerald-200 dark:hover:border-emerald-800"
        };
      case 'reposition_rejected':
      case 'reposition_deleted':
        return {
          icon: <XCircle className="w-5 h-5 text-white" />,
          gradient: "bg-gradient-to-br from-rose-500 to-red-600",
          shadow: "shadow-rose-200 dark:shadow-rose-900/20",
          border: "hover:border-rose-200 dark:hover:border-rose-800"
        };
      case 'completion_approval_needed':
      case 'partial_transfer_warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-white" />,
          gradient: "bg-gradient-to-br from-amber-400 to-orange-500",
          shadow: "shadow-amber-200 dark:shadow-amber-900/20",
          border: "hover:border-amber-200 dark:hover:border-amber-800"
        };
      default: // Info / New / System
        return {
          icon: <Bell className="w-5 h-5 text-white" />,
          gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
          shadow: "shadow-violet-200 dark:shadow-violet-900/20",
          border: "hover:border-violet-200 dark:hover:border-violet-800"
        };
    }
  };

  const formatTimeAgo = (dateInput: string | Date) => {
    const date = fixDate(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Ahora mismo";
    if (diffMinutes < 60) return `Hace ${diffMinutes}m`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString("es-MX", { day: '2-digit', month: '2-digit' });
  };

  const toggleExpansion = (id: number) => {
    setExpandedNotifications(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleNotificationClick = (item: any) => {
    // The user requested to deprecate /orders for these notifications
    // and route everything to /repositions
    setLocation("/repositions");
    onClose();
  };

  // --- Grouping Logic ---
  const groupedNotifications = useMemo(() => {
    // 1. Combine all notifications with a standard 'date' field and 'type' context
    const all = [
      ...pendingTransfers.map((t: any) => ({ ...t, kind: 'transfer', dateObj: fixDate(t.createdAt) })),
      ...repositionNotifications.map((n: any) => ({ ...n, kind: 'notification', dateObj: fixDate(n.createdAt) }))
    ];

    // 2. Sort by date desc
    all.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

    // 3. Filter by tab
    const filtered = all.filter(item => {
      if (activeTab === 'all') return true;
      if (activeTab === 'transfers') return item.kind === 'transfer';
      if (activeTab === 'system') return item.kind === 'notification';
      return true;
    });

    // 4. Group by Date Label
    const groups: Record<string, any[]> = {
      "Hoy": [],
      "Ayer": [],
      "Esta Semana": [],
      "Anteriormente": []
    };

    filtered.forEach(item => {
      if (isToday(item.dateObj)) groups["Hoy"].push(item);
      else if (isYesterday(item.dateObj)) groups["Ayer"].push(item);
      else if (isThisWeek(item.dateObj)) groups["Esta Semana"].push(item);
      else groups["Anteriormente"].push(item);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [pendingTransfers, repositionNotifications, activeTab]);

  const totalNotifications = pendingTransfers.length + repositionNotifications.length;

  // --- Render Components ---

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        <div className="relative w-24 h-24 bg-gradient-to-tr from-slate-100 to-white dark:from-slate-800 dark:to-slate-700 rounded-3xl shadow-xl flex items-center justify-center mb-6 ring-1 ring-white/50">
          <PartyPopperIcon />
        </div>
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">¡Todo al día!</h3>
      <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">
        No hay notificaciones pendientes. Disfruta tu día.
      </p>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[95vw] sm:w-[500px] p-0 gap-0 border-l shadow-2xl bg-slate-50/80 dark:bg-[#0f172a]/90 backdrop-blur-2xl flex flex-col transition-all duration-300">

        {/* Sticky Professional Header */}
        <div className="sticky top-0 z-30 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-xl border-b border-border/50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                    <BellRing className="w-5 h-5 text-white" />
                  </div>
                  {totalNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">Notificaciones</h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    {totalNotifications} {totalNotifications === 1 ? 'pendiente' : 'pendientes'}
                  </p>
                </div>
              </div>

              {totalNotifications > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => clearAllNotificationsMutation.mutate()}
                  className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                  title="Marcar todo como leído"
                >
                  <Check className="w-5 h-5" />Limpiar
                </Button>
              )}
            </div>

            {/* Floating Segmented Control */}
            <div className="flex p-1 bg-muted/50 rounded-xl gap-1 border border-border/50">
              {(['all', 'transfers', 'system'] as const).map((tab) => {
                const isActive = activeTab === tab;
                const labels = { all: 'Todo', transfers: 'Transferencias', system: 'Sistema' };
                const counts = {
                  all: 0,
                  transfers: pendingTransfers.length,
                  system: repositionNotifications.length
                };

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300",
                      isActive
                        ? "bg-white dark:bg-slate-800 text-foreground shadow-sm ring-1 ring-black/5"
                        : "text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-foreground/80"
                    )}
                  >
                    {labels[tab]}
                    {tab !== 'all' && counts[tab] > 0 && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-full text-[10px]",
                        isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {counts[tab]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-4 sm:px-6 bg-slate-50/50 dark:bg-transparent">
          <div className="py-6 space-y-8 min-h-full">
            
            {/* Banner for push notifications */}
            <NotificationPermission />

            {totalNotifications === 0 && <EmptyState />}

            {groupedNotifications.map(([groupName, items], groupIndex) => (
              <div
                key={groupName}
                className="space-y-3 animate-in slide-in-from-bottom-4 fade-in duration-500"
                style={{ animationDelay: `${groupIndex * 100}ms` }}
              >
                <div className="flex items-center gap-2 pl-1">
                  <div className="h-px bg-border/60 flex-1" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider bg-transparent px-2">
                    {groupName}
                  </span>
                  <div className="h-px bg-border/60 w-4" />
                </div>

                <div className="space-y-3">
                  {items.map((item) => {
                    if (item.kind === 'transfer') {
                      return <TransferCard
                        key={`transfer-${item.id}`}
                        transfer={item}
                        onAccept={acceptTransferMutation.mutate}
                        onReject={rejectTransferMutation.mutate}
                        isLoading={acceptTransferMutation.isPending || rejectTransferMutation.isPending}
                        getAreaName={getAreaDisplayName}
                        onClick={() => handleNotificationClick(item)}
                      />;
                    } else {
                      return <NotificationCard
                        key={`notif-${item.id}`}
                        notif={item}
                        style={getStyle(item.type)}
                        isExpanded={expandedNotifications.has(item.id)}
                        onToggle={() => toggleExpansion(item.id)}
                        onRead={() => markNotificationReadMutation.mutate(item.id)}
                        onClick={() => handleNotificationClick(item)}
                      />;
                    }
                  })}
                </div>
              </div>
            ))}

            {/* Bottom spacer */}
            <div className="h-12" />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// --- Sub-components (Extracted for cleaner main component) ---

function TransferCard({ transfer, onAccept, onReject, isLoading, getAreaName, onClick }: any) {
  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-border/60 dark:border-border/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Gradient Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200 dark:shadow-blue-900/20 shadow-lg flex items-center justify-center shrink-0 text-white">
          <ArrowRight className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-foreground text-sm">Transferencia Solicitada</h4>
              <p className="text-sm text-foreground/80 mt-0.5">
                <span className="font-semibold text-blue-600 dark:text-blue-400">Reposición #{transfer.repositionId}</span> desde {getAreaName(transfer.fromArea)}
              </p>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-full">
              {format(fixDate(transfer.createdAt), "HH:mm")}
            </span>
          </div>

          {transfer.notes && (
            <div className="mt-2 text-xs text-muted-foreground bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-border/50 italic">
              "{transfer.notes}"
            </div>
          )}

          <div className="flex gap-2 mt-3 pt-1">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/10"
              onClick={(e) => { e.stopPropagation(); onAccept(transfer.id); }}
              disabled={isLoading}
            >
              Aceptar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs border-slate-200 hover:bg-slate-100 hover:text-slate-700 text-slate-500"
              onClick={(e) => { e.stopPropagation(); onReject(transfer.id); }}
              disabled={isLoading}
            >
              Rechazar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationCard({ notif, style, isExpanded, onToggle, onRead, onClick }: any) {
  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-border/60 dark:border-border/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-105", style.gradient, style.shadow)}>
          {style.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-foreground text-sm leading-tight pr-4">
              {notif.title}
            </h4>
            <button
              onClick={(e) => { e.stopPropagation(); onRead(); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-1.5">
            <p className={cn("text-xs text-muted-foreground leading-relaxed", !isExpanded && "line-clamp-2")}>
              {notif.message}
            </p>
            {notif.message && notif.message.length > 90 && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="text-[10px] font-bold text-primary hover:underline mt-1 flex items-center gap-0.5 opacity-80 hover:opacity-100"
              >
                {isExpanded ? <>Ver menos <ChevronUp className="w-3 h-3" /></> : <>Ver más <ChevronDown className="w-3 h-3" /></>}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            {notif.repositionId ? (
              <Badge variant="outline" className="text-[10px] h-5 px-2 font-medium border-border/60 bg-slate-50 dark:bg-slate-800/50">
                #{notif.repositionId}
              </Badge>
            ) : <span />}

            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> {format(fixDate(notif.createdAt), "HH:mm")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const PartyPopperIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500"><path d="M5.8 11.3 2 22l10.7-3.79" /><path d="M4 3h.01" /><path d="M22 8h.01" /><path d="M15 2h.01" /><path d="M22 20h.01" /><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" /><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17" /><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7" /><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" /></svg>
);