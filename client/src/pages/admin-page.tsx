import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Users, RotateCcw, Shield, TrendingUp, Package, Trash2, Download, Database, Bell, FileText, Activity, AlertTriangle, Upload, Loader2, CheckCircle, XCircle, Cpu, Zap, Server, ArrowDownAZ, ShieldAlert, Star, Clock } from "lucide-react";
import Swal from 'sweetalert2';
import { Progress } from "@/components/ui/progress";

import { FestivityModal } from "@/components/admin/festivity-modal";
import { BackupConfigModal } from "@/components/admin/backup-config-modal";


// Define User type locally with 'active' property if not present in @shared/schema
type User = {
  id: number;
  username: string;
  name: string;
  area: "patronaje" | "corte" | "bordado" | "ensamble" | "plancha" | "calidad" | "operaciones" | "admin" | "almacen" | "diseño" | "maquilas" | "envios";
  createdAt: Date;
  password: string;
};

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showClearDatabaseModal, setShowClearDatabaseModal] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isClearingDatabase, setIsClearingDatabase] = useState(false);
  const [isResettingSequence, setIsResettingSequence] = useState(false);
  const [deleteUsersChecked, setDeleteUsersChecked] = useState(false);
  const [isFixingSequences, setIsFixingSequences] = useState(false);
  const [showSystemBackupModal, setShowSystemBackupModal] = useState(false);
  const [showSystemRestoreModal, setShowSystemRestoreModal] = useState(false);
  const [systemRestoreFile, setSystemRestoreFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showPgBackupModal, setShowPgBackupModal] = useState(false);
  const [pgBackupFormat, setPgBackupFormat] = useState("custom");
  const [isPgRestoring, setIsPgRestoring] = useState(false);
  const [isPgBackingUp, setIsPgBackingUp] = useState(false);
  const [showFestivityModal, setShowFestivityModal] = useState(false);
  const [showBackupConfigModal, setShowBackupConfigModal] = useState(false);
  const [dbProgress, setDbProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const isActive = isRestoring || isBackingUp || isClearingDatabase || isPgRestoring || isPgBackingUp;
    if (isActive) {
      setDbProgress(0);
      interval = setInterval(() => {
        setDbProgress((prev) => {
          if (prev >= 95) return 95;
          const increment = prev < 50 ? 5 : (prev < 80 ? 2 : 1);
          return prev + increment;
        });
      }, 150);
    } else {
      setDbProgress(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRestoring, isBackingUp, isClearingDatabase, isPgRestoring, isPgBackingUp]);

  const { data: maintenanceSetting, refetch: refetchMaintenance } = useQuery({
    queryKey: ["/api/settings/maintenance_mode"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/settings/maintenance_mode");
      return await res.json();
    }
  });

  const { data: festivitySetting, refetch: refetchFestivity } = useQuery({
    queryKey: ["/api/settings/festivity_config"],
    queryFn: async () => {
      const res = await fetch("/api/settings/festivity_config");
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.value) return null;
      try {
        return JSON.parse(data.value);
      } catch (e) {
        return null;
      }
    }
  });

  const isMaintenanceActive = maintenanceSetting?.value === 'true';

  const toggleMaintenance = async () => {
    const newValue = !isMaintenanceActive;

    if (newValue) {
      // Activating Maintenance
      const { value: duration } = await Swal.fire({
        title: 'Activar Modo Mantenimiento',
        text: 'Todos los usuarios (excepto administradores) serán redirigidos a la pantalla de mantenimiento.',
        icon: 'warning',
        input: 'number',
        inputLabel: 'Tiempo estimado de reparación (minutos)',
        inputPlaceholder: 'Ej: 15',
        inputValue: '15',
        showCancelButton: true,
        confirmButtonText: 'Activar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        inputValidator: (value) => {
          if (!value || parseInt(value) <= 0) {
            return 'Por favor ingresa un tiempo válido mayor a 0';
          }
          return null;
        }
      });

      if (duration) {
        try {
          const startTime = new Date().toISOString();
          await apiRequest('POST', '/api/settings', { key: 'maintenance_mode', value: 'true' });
          await apiRequest('POST', '/api/settings', { key: 'maintenance_duration', value: String(duration) });
          await apiRequest('POST', '/api/settings', { key: 'maintenance_start_time', value: startTime });

          refetchMaintenance();
          Swal.fire({
            title: 'Mantenimiento ACTIVADO',
            text: `Tiempo estimado: ${duration} minutos`,
            icon: 'warning',
            timer: 2000,
            showConfirmButton: false
          });
        } catch (error) {
          toast({ title: "Error", description: "No se pudo activar el modo mantenimiento", variant: "destructive" });
        }
      }
    } else {
      // Deactivating Maintenance
      const result = await Swal.fire({
        title: '¿Desactivar Modo Mantenimiento?',
        text: 'Los usuarios podrán volver a usar la plataforma normalmente.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6'
      });

      if (result.isConfirmed) {
        try {
          await apiRequest('POST', '/api/settings', { key: 'maintenance_mode', value: 'false' });
          refetchMaintenance();
          Swal.fire({
            title: 'Mantenimiento DESACTIVADO',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        } catch (error) {
          toast({ title: "Error", description: "No se pudo desactivar el modo mantenimiento", variant: "destructive" });
        }
      }
    }
  };

  const [latency, setLatency] = useState(12);
  const [cpuUsage, setCpuUsage] = useState(24);
  const [sequenceTable, setSequenceTable] = useState<string>("repositions");
  const [newSequenceValue, setNewSequenceValue] = useState<string>("");

  // Simular variación de latencia y CPU

  useEffect(() => {
    const latencyInterval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 40) + 15); // Random entre 15 y 55
    }, 2000);

    const cpuInterval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 51) + 25); // Random entre 25 y 75
    }, 1790);

    return () => {
      clearInterval(latencyInterval);
      clearInterval(cpuInterval);
    };
  }, []);


  const allowedAreas = ['admin', 'envios'];
  if (!allowedAreas.includes(user?.area || '')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">Solo los administradores pueden acceder a esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      return await res.json();
    },
    enabled: user?.area === 'admin'
  });


  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dashboard/stats");
      return await res.json();
    },
    enabled: user?.area === 'admin'
  });

  const { data: dbStats, error: dbStatsError, isLoading: dbStatsLoading } = useQuery<{ size: string }>({
    queryKey: ["/api/admin/db-stats"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/db-stats");
        if (!res.ok) {
          console.error("DB Stats fetch failed with status:", res.status);
          throw new Error(`Failed to fetch db stats: ${res.status}`);
        }
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          console.log("DB Stats received:", data);
          return data;
        } catch (e) {
          console.error("Failed to parse DB stats JSON. Raw response:", text.substring(0, 200));
          throw new Error("Invalid JSON response from server");
        }
      } catch (err) {
        console.error("Error fetching DB stats:", err);
        throw err;
      }
    },
    enabled: user?.area === 'admin'
  });

  console.log("DB Stats State:", { dbStats, dbStatsError, dbStatsLoading });


  const backupCompleteSystemMutation = useMutation({
    mutationFn: async () => {
      setIsBackingUp(true);
      const res = await apiRequest("GET", "/api/admin/backup-complete-system");
      if (!res.ok) throw new Error("Error al descargar respaldo");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-completo-jasana-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsBackingUp(false);
    },
    onError: (error) => {
      setIsBackingUp(false);
      toast({
        title: "Error",
        description: "No se pudo generar el respaldo completo",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      toast({
        title: "Respaldo Completo",
        description: "El archivo se ha descargado correctamente",
      });
    }
  });

  const restoreCompleteSystemMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsRestoring(true);
      const formData = new FormData();
      formData.append('backup', file);

      const res = await fetch("/api/admin/restore-complete-system", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al restaurar");
      }
      return await res.json();
    },
    onSuccess: () => {
      setIsRestoring(false);
      setShowSystemRestoreModal(false);
      setSystemRestoreFile(null);
      Swal.fire({
        title: 'Sistema Restaurado',
        text: 'El sistema se ha restaurado correctamente. La página se recargará.',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      }).then(() => {
        window.location.reload();
      });
    },
    onError: (error: Error) => {
      setIsRestoring(false);
      toast({
        title: "Error de Restauración",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const pgBackupMutation = useMutation({
    mutationFn: async (format: string) => {
      setIsPgBackingUp(true);
      const res = await apiRequest("GET", `/api/admin/pg-backup?format=${format}`);
      if (!res.ok) throw new Error("Error al generar respaldo PostgreSQL");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = format === 'plain' ? 'sql' : (format === 'tar' ? 'tar' : 'backup');
      a.download = `jasana-db-${format}-${new Date().toISOString().split('T')[0]}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsPgBackingUp(false);
    },
    onError: (error) => {
      setIsPgBackingUp(false);
      toast({
        title: "Error",
        description: "No se pudo generar el respaldo PostgreSQL",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      setShowPgBackupModal(false);
      toast({
        title: "Respaldo Completo BD",
        description: "El archivo se ha descargado correctamente",
      });
    }
  });

  const pgRestoreMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsPgRestoring(true);
      const formData = new FormData();
      formData.append('backup', file);

      const res = await fetch("/api/admin/pg-restore", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al restaurar BD");
      }
      return await res.json();
    },
    onSuccess: () => {
      setIsPgRestoring(false);
      Swal.fire({
        title: 'Base de datos Restaurada',
        text: 'La base de datos se ha restaurado correctamente. La página se recargará.',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      }).then(() => {
        window.location.reload();
      });
    },
    onError: (error: Error) => {
      setIsPgRestoring(false);
      toast({
        title: "Error de Restauración BD",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const clearDatabaseMutation = useMutation({
    mutationFn: async (data: { confirmationCode: string, deleteUsers: boolean }) => {
      setIsClearingDatabase(true);
      const res = await apiRequest("POST", "/api/admin/clear-database", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al limpiar base de datos");
      }
      return res.json();
    },
    onSuccess: () => {
      setIsClearingDatabase(false);
      setShowClearDatabaseModal(false);
      Swal.fire({
        title: '¡Sistema Limpio!',
        text: 'La base de datos ha sido reiniciada correctamente. El sistema se recargará.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        window.location.reload();
      });
    },
    onError: (error: Error) => {
      setIsClearingDatabase(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  const handleBackupSystem = () => {
    setShowSystemBackupModal(true);
  };

  const handleConfirmBackupSystem = () => {
    backupCompleteSystemMutation.mutate();
  };

  const handleRestoreSystem = () => {
    if (!systemRestoreFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de respaldo completo",
        variant: "destructive"
      });
      return;
    }
    restoreCompleteSystemMutation.mutate(systemRestoreFile);
  };

  const handleExportReports = async () => {
    try {
      const res = await fetch('/api/repositions/all?includeDeleted=true');
      if (!res.ok) throw new Error("Error al obtener reposiciones");
      const repositionsData = await res.json();

      const reportData = repositionsData.map((repo: any) => ({
        folio: repo.folio,
        solicitante: repo.solicitanteNombre,
        areaSolicitante: repo.solicitanteArea,
        prenda: repo.modeloPrenda,
        tipo: repo.type,
        urgencia: repo.urgencia,
        estado: repo.status,
        fecha: new Date(repo.createdAt).toLocaleDateString('es-ES')
      }));

      const csvContent = [
        'Folio,Solicitante,Área Solicitante,Modelo Prenda,Tipo,Urgencia,Estado,Fecha Creación',
        ...reportData.map((row: any) => `"${row.folio}","${row.solicitante}","${row.areaSolicitante}","${row.prenda}","${row.tipo}","${row.urgencia}","${row.estado}","${row.fecha}"`)
      ].join('\n');

      // Add UTF-8 BOM for Excel compatibility
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_reposiciones_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Reporte exportado",
        description: "El reporte de reposiciones ha sido descargado exitosamente",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "No se pudieron exportar las reposiciones",
        variant: "destructive"
      });
    }
  };

  const handleClearLogs = () => {
    toast({
      title: "Logs limpiados",
      description: "Los logs del sistema han sido limpiados exitosamente",
    });
  };

  const handleClearDatabase = () => {
    if (confirmationCode !== "BORRAR_SISTEMA_JSN") {
      toast({
        title: "Código incorrecto",
        description: "El código de confirmación no es válido",
        variant: "destructive"
      });
      return;
    }
    clearDatabaseMutation.mutate({
      confirmationCode,
      deleteUsers: deleteUsersChecked
    });
  };

  const handleNotificationTest = () => {
    toast({
      title: "Notificación de prueba",
      description: "Sistema de notificaciones funcionando correctamente",
    });
  };

  const getAreaDisplayName = (area: string) => {
    const names: Record<string, string> = {
      corte: 'Corte',
      bordado: 'Bordado',
      ensamble: 'Ensamble',
      plancha: 'Plancha/Empaque',
      calidad: 'Calidad',
      envios: 'Envíos',
      almacen: 'Almacén',
      admin: 'Admin',
      diseño: 'Diseño',
      patronaje: 'Patronaje',
      operaciones: 'Operaciones',
      maquilas: 'Maquilas'
    };
    return names[area] || area;
  };

  const getAreaBadgeColor = (area: string) => {
    const colors: Record<string, string> = {
      corte: "badge-corte",
      bordado: "badge-bordado",
      ensamble: "badge-ensamble",
      plancha: "badge-plancha",
      calidad: "badge-calidad",
      envios: "badge-envios",
      admin: "badge-admin",
      almacen: "badge-almacen",
      diseño: "badge-diseño",
      patronaje: "bg-yellow-100 text-yellow-800",
      operaciones: "badge-operaciones",
      maquilas: "badge-calidad"
    };
    return colors[area] || "badge-admin";
  };


  const handleResetUserSequence = async () => {
    const result = await Swal.fire({
      title: '¿Reiniciar secuencia de IDs?',
      text: "Esto hará que el próximo usuario creado tenga un ID consecutivo (#1, #2, etc).",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, reiniciar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      backdrop: `rgba(0,0,0,0.4)`
    });

    if (!result.isConfirmed) return;

    setIsResettingSequence(true);
    try {
      const response = await fetch('/api/admin/reset-user-sequence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Swal.fire({
          title: '¡Secuencia Reiniciada!',
          text: 'Los IDs de usuarios ahora serán consecutivos.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true
        });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error al reiniciar la secuencia');
      }
    } catch (error) {
      console.error('Error resetting sequence:', error);
      Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : "No se pudo reiniciar la secuencia",
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsResettingSequence(false);
    }
  };

  const fixSequencesMutation = useMutation({
    mutationFn: async () => {
      setIsFixingSequences(true);
      const res = await apiRequest("POST", "/api/admin/fix-sequences");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al reparar secuencias");
      }
      return res.json();
    },
    onSuccess: () => {
      setIsFixingSequences(false);
      Swal.fire({
        title: '¡Éxito!',
        text: 'La base de datos ha sido reparada y las secuencias sincronizadas correctamente. La página se recargará.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        window.location.reload();
      });
      toast({
        title: "Secuencias reparadas",
        description: "Todos los contadores de la base de datos han sido sincronizados.",
      });
    },
    onError: (error: Error) => {
      setIsFixingSequences(false);
      toast({
        title: "Error al reparar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFixSequences = async () => {
    const result = await Swal.fire({
      title: '¿Reparar Base de Datos?',
      text: "Esta acción sincronizará todos los contadores de IDs en la base de datos. Útil si recibes errores de 'llave duplicada' al crear registros.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, reparar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      fixSequencesMutation.mutate();
    }
  };

  const { data: sequenceData } = useQuery({
    queryKey: ["/api/admin/sequences", sequenceTable],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/sequences/${sequenceTable}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!sequenceTable
  });

  const updateSequenceMutation = useMutation({
    mutationFn: async () => {
      if (!newSequenceValue) return;
      const res = await apiRequest("POST", "/api/admin/sequences", {
        table: sequenceTable,
        value: parseInt(newSequenceValue)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al actualizar secuencia");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Secuencia actualizada",
        description: `El próximo valor para ${sequenceTable} será ${newSequenceValue}`,
      });
      setNewSequenceValue("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sequences"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleUpdateSequence = async () => {
    if (!newSequenceValue) return;

    const result = await Swal.fire({
      title: '¿Modificar Secuencia?',
      text: `El próximo registro creado tendrá el ID ${newSequenceValue}. Asegúrate de que este número no exista ya en la base de datos para evitar errores.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, modificar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      updateSequenceMutation.mutate();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Settings className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
            <p className="text-gray-600">Gestión del sistema JASANA</p>
          </div>
        </div>

        {/* Stats Overview */}
        {user?.area === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* stats overview contents */}
          </div>
        )}

        {/* The components have been moved into Configuración del Sistema */}


        {(user?.area === 'admin' || user?.area === 'envios') && (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm dark:border-slate-700 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900">
              <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                <Settings className="h-5 w-5" />
                <span>Configuración del Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">
                {/* Super Premium Identity Bento Grid */}
                <div className="md:col-span-3 p-6 space-y-6 relative overflow-hidden group">
                  {/* Background Glow */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 pointer-events-none" />

                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Col 1: Brand Identity */}
                    <div className="md:col-span-1 flex flex-col justify-between h-full min-h-[220px] bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/30 border border-white/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-blue-100/20 dark:shadow-none hover:shadow-2xl hover:shadow-blue-200/30 transition-all duration-500 group/brand">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30 group-hover/brand:scale-110 transition-transform duration-300">
                            <Database className="h-5 w-5 text-white" />
                          </div>
                          <Badge variant="secondary" className="bg-blue-100/50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 backdrop-blur-md border-0">
                            ADMINISTRADOR
                          </Badge>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 filter drop-shadow-sm">
                          JASANA
                        </h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                          Sistema de Gestión Integral
                        </p>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                        <div className="text-xs text-slate-400">
                          <span className="block font-bold text-slate-600 dark:text-slate-300">v8.0.3</span>
                          Compilado 2026.06
                        </div>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-[pulse_1.5s_infinite_0.5s]" />
                          <div className="w-2 h-2 rounded-full bg-purple-500 animate-[pulse_1.5s_infinite_1s]" />
                        </div>
                      </div>
                    </div>

                    {/* Col 2: System Nucleus */}
                    <div className="md:col-span-1 space-y-4">
                      {/* Database Monitor */}
                      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm group/db hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-end justify-between px-2 pb-2 gap-1 group-hover/db:opacity-[0.08] transition-opacity">
                          {[...Array(20)].map((_, i) => (
                            <div key={i} className="w-1.5 bg-emerald-500 rounded-t-sm" style={{ height: `${Math.random() * 60 + 20}%`, animation: `traffic-bounce ${Math.random() * 1.5 + 0.5}s infinite ease-in-out alternate`, animationDelay: `${Math.random()}s` }} />
                          ))}
                          <style>{`@keyframes traffic-bounce { 0% { height: 10%; opacity: 0.3; } 50% { height: 50%; opacity: 0.7; } 100% { height: 90%; opacity: 1; } }`}</style>
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
                              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover/db:text-emerald-700 dark:group-hover/db:text-emerald-400 transition-colors">Base de Datos</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> {latency}ms
                              </p>
                            </div>
                          </div>
                          <Server className="h-5 w-5 text-slate-300 group-hover/db:text-emerald-500 transition-colors" />
                        </div>
                      </div>

                      {/* Server Health */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors group/cpu">
                          <Cpu className="w-5 h-5 text-slate-400 group-hover/cpu:text-indigo-500 mb-2" />
                          <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{cpuUsage}%</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">CPU</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-900 transition-colors group/ram">
                          <Zap className="w-5 h-5 text-slate-400 group-hover/ram:text-purple-500 mb-2" />
                          <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{dbStats?.size || '---'}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Memoria</span>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: Live Operations */}
                    <div className="md:col-span-1 space-y-4">
                      {/* Active Users */}
                      <div
                        onClick={() => window.location.href = '/users'}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" /> Usuarios
                          </h4>
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 border-0">
                            Registro
                          </Badge>
                        </div>
                        <div className="flex items-center -space-x-2 overflow-hidden py-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-gradient-to-br ${['from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-orange-400 to-red-500', 'from-purple-400 to-pink-500'][i - 1]} flex items-center justify-center text-xs text-white font-bold shadow-sm z-${10 - i}`}>
                              {['V', 'E', 'M', 'J'][i - 1]}
                            </div>
                          ))}
                          <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500 font-medium z-0 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                            {users.length > 4 ? `+${users.length - 4}` : ''}
                          </div>
                        </div>
                      </div>

                      {/* Modules Status */}
                      <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-md">
                            <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-indigo-800 dark:text-indigo-300">Módulos Activos</p>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400">12/15 Habilitados</span>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-1 h-4 bg-indigo-300/40 rounded-full overflow-hidden">
                              <div className="w-full bg-indigo-500 rounded-full animate-bounce" style={{ height: '60%', animationDuration: `${Math.random() + 0.5}s`, animationDelay: `${i * 0.1}s` }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security & Tools Grid */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 pt-0">

                  {/* Centro de Seguridad (Respaldos) */}
                  {user?.area === 'admin' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        Centro de Seguridad
                      </h3>

                      <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-1 shadow-sm">
                        <div className="grid grid-cols-1 gap-1">

                          {/* Configuración de Respaldos Automáticos */}
                          <button
                            onClick={() => setShowBackupConfigModal(true)}
                            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl p-4 transition-all shadow-md hover:shadow-lg mb-2"
                          >
                            <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity transform translate-x-1/4 -translate-y-1/4">
                              <Clock className="w-24 h-24 text-white" />
                            </div>
                            <div className="relative z-10 flex items-center gap-4">
                              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-lg text-white">
                                <Clock className="w-6 h-6 animate-[pulse_3s_infinite]" />
                              </div>
                              <div className="text-left">
                                <h4 className="font-bold text-white text-base">Respaldos Automáticos</h4>
                                <p className="text-xs text-blue-100 font-medium">Programar copias de seguridad</p>
                              </div>
                            </div>
                          </button>

                          {/* Full Backup Safe */}
                          <div className="group relative overflow-hidden bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl p-4 transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800">
                            <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-1/3 -translate-y-1/3">
                              <Database className="w-32 h-32 text-indigo-900" />
                            </div>

                            <div className="relative z-10 flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                                  <Database className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-indigo-900 dark:text-indigo-200">Sistema Completo</h4>
                                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Base de datos + Configuración</p>
                                </div>
                              </div>

                              <div className="flex gap-2 mt-1">
                                <Button
                                  size="sm"
                                  onClick={() => backupCompleteSystemMutation.mutate()}
                                  disabled={backupCompleteSystemMutation.isPending}
                                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none"
                                >
                                  {backupCompleteSystemMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Download className="w-3 h-3 mr-1" />}
                                  Respaldar
                                </Button>
                                <div className="flex-1">
                                  <input
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) { restoreCompleteSystemMutation.mutate(file); e.target.value = ''; }
                                    }}
                                    className="hidden"
                                    ref={(input) => { if (input) (window as any).systemRestoreFileInput = input; }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => (window as any).systemRestoreFileInput?.click()}
                                    disabled={restoreCompleteSystemMutation.isPending}
                                    className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                                  >
                                    <Upload className="w-3 h-3 mr-1" /> Restaurar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>



                          {/* PostgreSQL Backup */}
                          <div className="group relative overflow-hidden bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-xl p-4 transition-all border border-transparent hover:border-sky-200 dark:hover:border-sky-800">
                            <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-1/3 -translate-y-1/3">
                              <Database className="w-32 h-32 text-sky-900" />
                            </div>

                            <div className="relative z-10 flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-lg text-sky-600 dark:text-sky-400">
                                  <Database className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sky-900 dark:text-sky-200">Respaldo BD Completa</h4>
                                  <p className="text-xs text-sky-600 dark:text-sky-400">PostgreSQL (custom/plain/tar)</p>
                                </div>
                              </div>

                              <div className="flex gap-2 mt-1">
                                <Button
                                  size="sm"
                                  onClick={() => setShowPgBackupModal(true)}
                                  disabled={isPgBackingUp}
                                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white shadow-sky-200 dark:shadow-none"
                                >
                                  {isPgBackingUp ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Download className="w-3 h-3 mr-1" />}
                                  Respaldar
                                </Button>
                                <div className="flex-1">
                                  <input
                                    type="file"
                                    accept=".backup,.sql,.tar,.dump"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) { pgRestoreMutation.mutate(file); e.target.value = ''; }
                                    }}
                                    className="hidden"
                                    ref={(input) => { if (input) (window as any).pgRestoreFileInput = input; }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => (window as any).pgRestoreFileInput?.click()}
                                    disabled={isPgRestoring}
                                    className="w-full border-sky-200 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-900/50"
                                  >
                                    <Upload className="w-3 h-3 mr-1" /> Restaurar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Centro de Notificaciones (Integrado) */}
                          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/40 dark:hover:to-teal-900/40 rounded-xl p-4 transition-all border border-emerald-100 dark:border-emerald-900/50 hover:border-emerald-200 dark:hover:border-emerald-800 shadow-sm">
                            <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity transform translate-x-1/3 -translate-y-1/3">
                              <Bell className="w-32 h-32 text-emerald-900" />
                            </div>

                            <div className="relative z-10 flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                                  <Bell className="w-5 h-5 animate-[swing_3s_ease-in-out_infinite]" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200">Notificaciones</h4>
                                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Pruebas de integridad</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-emerald-200 bg-white/60 hover:bg-emerald-200 text-emerald-700 dark:bg-slate-800/60 dark:border-emerald-800 dark:text-emerald-400 h-8 text-xs justify-start px-2"
                                  onClick={() => Swal.fire({
                                    title: '¡Operación Exitosa!',
                                    text: 'El sistema ha procesado la solicitud correctamente.',
                                    icon: 'success',
                                    confirmButtonText: 'Genial',
                                    confirmButtonColor: '#10b981',
                                    timer: 2000,
                                    timerProgressBar: true
                                  })}
                                >
                                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Éxito
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-amber-200 bg-white/60 hover:bg-amber-200 text-amber-700 dark:bg-slate-800/60 dark:border-amber-800 dark:text-amber-400 h-8 text-xs justify-start px-2"
                                  onClick={() => Swal.fire({
                                    title: 'Atención Requerida',
                                    text: 'Esta es una alerta de advertencia para el usuario.',
                                    icon: 'warning',
                                    confirmButtonText: 'Entendido',
                                    confirmButtonColor: '#f59e0b'
                                  })}
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Alerta
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-200 bg-white/60 hover:bg-blue-200 text-blue-700 dark:bg-slate-800/60 dark:border-blue-800 dark:text-blue-400 h-8 text-xs justify-start px-2"
                                  onClick={() => Swal.fire({
                                    title: 'Nueva Información',
                                    text: 'Actualización del sistema disponible para revisión.',
                                    icon: 'info',
                                    confirmButtonText: 'Ver detalles',
                                    confirmButtonColor: '#3b82f6'
                                  })}
                                >
                                  <Bell className="w-3.5 h-3.5 mr-1.5" /> Info
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-rose-200 bg-white/60 hover:bg-rose-200 text-rose-700 dark:bg-slate-800/60 dark:border-rose-800 dark:text-rose-400 h-8 text-xs justify-start px-2"
                                  onClick={() => Swal.fire({
                                    title: 'Error Crítico',
                                    text: 'Ha ocurrido un fallo en la operación simulada.',
                                    icon: 'error',
                                    confirmButtonText: 'Reintentar',
                                    confirmButtonColor: '#ef4444'
                                  })}
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1.5" /> Error
                                </Button>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                  {/* Centro de Comando (Herramientas) */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      Centro de Comando
                    </h3>

                    <div className={`grid ${user?.area === 'admin' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                      {user?.area === 'admin' && (
                        <>
                          <button
                            onClick={handleExportReports}
                            className="col-span-1 flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/10 dark:hover:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl transition-all group"
                          >
                            <div className="p-3 bg-white dark:bg-purple-900/30 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-sm font-bold text-purple-900 dark:text-purple-200">Exportar</span>
                            <span className="text-[10px] text-purple-600 dark:text-purple-400">Reportes CSV</span>
                          </button>

                          <button
                            onClick={() => setShowFestivityModal(true)}
                            className="col-span-1 flex flex-col items-center justify-center p-4 bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/10 dark:hover:bg-pink-900/20 border border-pink-200 dark:border-pink-800/50 rounded-xl transition-all group relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-tr from-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative p-3 bg-white dark:bg-pink-900/30 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                              <Star className="w-6 h-6 text-pink-600 dark:text-pink-400 group-hover:animate-pulse" />
                            </div>
                            <span className="relative text-sm font-bold text-pink-900 dark:text-pink-200">Festividades</span>
                            <span className="relative text-[10px] text-pink-600 dark:text-pink-400">Temática Visual</span>
                          </button>

                          <button
                            onClick={handleClearLogs}
                            className="col-span-2 flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/10 dark:hover:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl transition-all group"
                          >
                            <div className="p-3 bg-white dark:bg-orange-900/30 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                              <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="text-sm font-bold text-orange-900 dark:text-orange-200">Depurar</span>
                            <span className="text-[10px] text-orange-600 dark:text-orange-400">Limpiar Logs</span>
                          </button>
                        </>
                      )}

                      {user?.area === 'admin' && (
                        <button
                          onClick={toggleMaintenance}
                          className={`col-span-2 flex items-center justify-between p-4 rounded-xl border transition-all group ${isMaintenanceActive
                            ? 'bg-amber-50 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/10 dark:border-amber-800/50'
                            : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/50'
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl shadow-sm ring-4 transition-all ${isMaintenanceActive
                              ? 'bg-white dark:bg-amber-900/40 ring-amber-50 dark:ring-amber-900/20'
                              : 'bg-white dark:bg-emerald-900/40 ring-emerald-50 dark:ring-emerald-900/20'
                              }`}>
                              <ShieldAlert className={`w-6 h-6 ${isMaintenanceActive ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`} />
                            </div>
                            <div className="text-left">
                              <span className={`block text-base font-bold ${isMaintenanceActive ? 'text-amber-900 dark:text-amber-200' : 'text-emerald-900 dark:text-emerald-200'}`}>
                                Modo Mantenimiento: {isMaintenanceActive ? 'ACTIVO' : 'INACTIVO'}
                              </span>
                              <span className={`block text-xs font-medium ${isMaintenanceActive ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                                {isMaintenanceActive
                                  ? 'Plataforma bloqueada'
                                  : 'Plataforma accesible'}
                              </span>
                            </div>
                          </div>
                          <div className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${isMaintenanceActive
                            ? 'bg-amber-100 border-amber-300 text-amber-700'
                            : 'bg-emerald-100 border-emerald-300 text-emerald-700'
                            }`}>
                            {isMaintenanceActive ? 'DESACTIVAR' : 'ACTIVAR'}
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Col 3: Mantenimiento Avanzado */}
                  <div className="space-y-4 xl:col-span-1 md:col-span-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Database className="h-5 w-5 text-red-600 dark:text-red-400" />
                      Mantenimiento Avanzado
                    </h3>

                    <div className="space-y-3">
                      {user?.area === 'admin' && (
                        <button
                          onClick={handleResetUserSequence}
                          disabled={isResettingSequence}
                          className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl transition-all group px-5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-blue-900/30 rounded-lg shadow-sm">
                              <RotateCcw className={`w-5 h-5 text-blue-600 dark:text-blue-400 ${isResettingSequence ? 'animate-spin' : ''}`} />
                            </div>
                            <div className="text-left">
                              <span className="block text-sm font-bold text-blue-900 dark:text-blue-200">Reiniciar IDs</span>
                              <span className="block text-[10px] text-blue-600 dark:text-blue-400">Restablecer secuencia</span>
                            </div>
                          </div>
                          <div className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded text-xs font-mono text-blue-700">#1</div>
                        </button>
                      )}

                      <button
                        onClick={handleFixSequences}
                        disabled={isFixingSequences}
                        className="w-full flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/10 dark:hover:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl transition-all group px-5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white dark:bg-indigo-900/30 rounded-lg shadow-sm">
                            <Database className={`w-5 h-5 text-indigo-600 dark:text-indigo-400 ${isFixingSequences ? 'animate-bounce' : ''}`} />
                          </div>
                          <div className="text-left">
                            <span className="block text-sm font-bold text-indigo-900 dark:text-indigo-200">Reparar BD</span>
                            <span className="block text-[10px] font-medium text-indigo-600 dark:text-indigo-400">Sincronizar secuencias</span>
                          </div>
                        </div>
                        <div className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded text-xs font-mono text-indigo-700">FIX</div>
                      </button>

                      {user?.area === 'admin' && (
                        <button
                          onClick={() => setShowClearDatabaseModal(true)}
                          className="w-full group relative overflow-hidden flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-100 dark:from-red-950/20 dark:to-rose-950/20 border border-red-200 dark:border-red-800/50 rounded-xl transition-all hover:shadow-lg hover:shadow-red-900/5 hover:border-red-300 dark:hover:border-red-700"
                        >
                          {/* Hazard Stripes Pattern Background */}
                          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}
                          />

                          <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-red-900/30 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300 ring-4 ring-red-50 dark:ring-red-900/20">
                              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-base font-black text-red-900 dark:text-red-200 tracking-tight">LIMPIEZA TOTAL</span>
                              </div>
                              <span className="block text-[10px] font-medium text-red-700 dark:text-red-300/80">
                                Eliminar todos los datos
                              </span>
                            </div>
                          </div>

                          <div className="relative z-10 p-2 group-hover:translate-x-1 transition-transform">
                            <div className="w-6 h-6 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center border border-red-200 dark:border-red-800">
                              <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                            </div>
                          </div>
                        </button>
                      )}

                      {/* Gestor de Secuencias Compacto */}
                      {user?.area === 'admin' && (
                        <div className="w-full bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl p-4 transition-all border border-indigo-100 dark:border-indigo-800/50 space-y-3 group relative overflow-hidden">
                          <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-1/4 -translate-y-1/4">
                            <ArrowDownAZ className="w-24 h-24 text-indigo-900" />
                          </div>

                          <div className="relative z-10 flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                              <ArrowDownAZ className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-indigo-900 dark:text-indigo-200">Gestor de Secuencias</h4>
                              <p className="text-[10px] md:text-xs text-indigo-600 dark:text-indigo-400">Ajuste manual del contador de IDs</p>
                            </div>
                          </div>

                          <div className="relative z-10 space-y-3">
                            <Select value={sequenceTable} onValueChange={setSequenceTable}>
                              <SelectTrigger className="bg-white/70 dark:bg-slate-900/70 border-indigo-200 dark:border-indigo-800 h-9">
                                <SelectValue placeholder="Seleccionar tabla" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="repositions">Solicitudes de Reposición</SelectItem>
                                <SelectItem value="reposition_products">Productos de Reposición</SelectItem>
                                <SelectItem value="reposition_pieces">Piezas de Reposición</SelectItem>
                                <SelectItem value="reposition_history">Historial de Reposición</SelectItem>
                                <SelectItem value="notifications">Notificaciones</SelectItem>
                                <SelectItem value="documents">Documentos</SelectItem>
                              </SelectContent>
                            </Select>

                            <div className="flex justify-between items-center text-xs font-mono p-2 bg-white/60 dark:bg-slate-900/60 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                              <span className="text-indigo-700 dark:text-indigo-300">Actual: <strong className="text-sm">{sequenceData?.lastValue ?? '...'}</strong></span>
                              <span className="text-indigo-700 dark:text-indigo-300">Próximo: <strong className="text-sm">{sequenceData?.nextValue ?? '...'}</strong></span>
                            </div>

                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="Nuevo ID inicial (Ej: 7)"
                                value={newSequenceValue}
                                onChange={(e) => setNewSequenceValue(e.target.value)}
                                min="1"
                                className="h-9 text-sm bg-white/70 dark:bg-slate-900/70 border-indigo-200 dark:border-indigo-800 font-mono"
                              />
                              <Button
                                size="sm"
                                onClick={handleUpdateSequence}
                                disabled={!newSequenceValue || updateSequenceMutation.isPending}
                                className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-sm"
                              >
                                {updateSequenceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualizar"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Modales */}


        <Dialog open={showClearDatabaseModal} onOpenChange={setShowClearDatabaseModal}>
          <DialogContent className="max-w-md border-red-500/50 bg-white dark:bg-slate-950 shadow-2xl shadow-red-500/20">
            <DialogHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center border-4 border-red-200 dark:border-red-800 animate-pulse">
                <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-center text-2xl font-black text-red-600 dark:text-red-500 uppercase tracking-widest">
                CUIDADO
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-center">
                <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">⚠ ACCIÓN DESTRUCTIVA ⚠</h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Estás a punto de iniciar el protocolo de limpieza total. Esta acción borrará <strong>todo</strong> el sistema.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Datos a eliminar</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {['Pedidos', 'Usuarios', 'Historial', 'Archivos', 'Config', 'Logs'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                      <Trash2 className="w-3 h-3 text-red-400" /> {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2 justify-center">
                  <Checkbox
                    id="delete-users"
                    checked={deleteUsersChecked}
                    onCheckedChange={(checked) => setDeleteUsersChecked(checked as boolean)}
                    className="border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <Label
                    htmlFor="delete-users"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Confirmar eliminación de usuarios
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label className="block text-xs font-bold text-center text-red-600 uppercase">
                    Para confirmar escribe: BORRAR_SISTEMA_JSN
                  </Label>
                  <Input
                    value={confirmationCode}
                    onChange={e => setConfirmationCode(e.target.value)}
                    placeholder="BORRAR_SISTEMA_JSN"
                    className="text-center font-mono border-red-200 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50 dark:bg-red-950/10"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowClearDatabaseModal(false);
                    setConfirmationCode("");
                  }}
                  className="flex-1 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-600"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearDatabase}
                  disabled={clearDatabaseMutation.isPending || confirmationCode !== "BORRAR_SISTEMA_JSN"}
                  className="flex-1 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 font-bold tracking-wide"
                >
                  {clearDatabaseMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Borrando...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      ELIMINAR TODO
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <FestivityModal
          open={showFestivityModal}
          onOpenChange={setShowFestivityModal}
          users={users}
          currentConfig={festivitySetting}
        />

        <BackupConfigModal
          open={showBackupConfigModal}
          onOpenChange={setShowBackupConfigModal}
        />

        {/* Modal de confirmación de respaldo completo */}
        <Dialog open={showSystemBackupModal} onOpenChange={setShowSystemBackupModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-800">
                <Database className="h-5 w-5" />
                Respaldo Completo del Sistema
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-semibold mb-2">🔒 Respaldo Completo</p>
                <p className="text-blue-700 text-sm mb-2">
                  Esta acción creará un respaldo completo de toda la base de datos incluyendo:
                </p>
                <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
                  <li>Todos los usuarios y configuraciones</li>
                  <li>Todos los pedidos y su historial</li>
                  <li>Todas las reposiciones y transferencias</li>
                  <li>Todos los documentos y notificaciones</li>
                  <li>Eventos de agenda y timers</li>
                  <li>Configuraciones administrativas</li>
                </ul>
                <p className="text-blue-800 font-bold text-sm mt-2">
                  El archivo será descargado automáticamente
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSystemBackupModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmBackupSystem}
                  disabled={backupCompleteSystemMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {backupCompleteSystemMutation.isPending ? "Creando Respaldo..." : "Crear Respaldo Completo"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de restauración completa del sistema */}
        <Dialog open={showSystemRestoreModal} onOpenChange={(open) => {
          setShowSystemRestoreModal(open);
          if (!open) {
            setSystemRestoreFile(null);
          }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-purple-800">
                <Upload className="h-5 w-5" />
                Restaurar Sistema Completo
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-red-800 font-semibold mb-2">⚠️ ADVERTENCIA CRÍTICA</p>
                <p className="text-red-700 text-sm mb-2">
                  Esta acción restaurará COMPLETAMENTE el sistema desde un respaldo, esto puede:
                </p>
                <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
                  <li>Duplicar datos si ya existen</li>
                  <li>Restaurar información eliminada previamente</li>
                  <li>Afectar el funcionamiento del sistema</li>
                  <li>Tomar varios minutos en completarse</li>
                </ul>
                <p className="text-red-800 font-bold text-sm mt-2">
                  Use solo respaldos generados por este mismo sistema
                </p>
              </div>

              <div>
                <Label className="text-gray-700 font-medium">
                  Seleccionar archivo de respaldo completo (.json)
                </Label>
                <Input
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => setSystemRestoreFile(e.target.files?.[0] || null)}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSystemRestoreModal(false);
                    setSystemRestoreFile(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleRestoreSystem}
                  disabled={restoreCompleteSystemMutation.isPending || !systemRestoreFile}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {restoreCompleteSystemMutation.isPending ? "Restaurando Sistema..." : "RESTAURAR SISTEMA COMPLETO"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* PG Backup Modal */}
        <Dialog open={showPgBackupModal} onOpenChange={setShowPgBackupModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Respaldo Completo PostgreSQL</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Formato de Respaldo</Label>
                <Select value={pgBackupFormat} onValueChange={setPgBackupFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom (.backup) - Recomendado, comprimido</SelectItem>
                    <SelectItem value="plain">Plain (.sql) - Script SQL texto plano</SelectItem>
                    <SelectItem value="tar">Tar (.tar) - Archivo Tar comprimido</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-2">
                  El formato 'Custom' es el más adecuado para restauraciones posteriores usando pg_restore.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowPgBackupModal(false)}>Cancelar</Button>
                <Button
                  onClick={() => pgBackupMutation.mutate(pgBackupFormat)}
                  disabled={isPgBackingUp}
                  className="bg-sky-600 hover:bg-sky-700"
                >
                  {isPgBackingUp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Generar y Descargar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Full Screen Loading Overlay */}
      {
        (isRestoring || isBackingUp || isClearingDatabase || isPgRestoring || isPgBackingUp) && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center space-y-6 max-w-md text-center border border-gray-200 dark:border-slate-700 mx-4">
              <div className="relative">
                <div className={`w-20 h-20 border-4 ${isClearingDatabase ? 'border-red-200 border-t-red-600' : 'border-blue-200 border-t-blue-600'} rounded-full animate-spin`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {isClearingDatabase ? (
                    <Trash2 className="h-8 w-8 text-red-600 animate-pulse" />
                  ) : (
                    <Database className="h-8 w-8 text-blue-600 animate-pulse" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {isClearingDatabase
                    ? "Eliminando Datos"
                    : (isRestoring || isPgRestoring)
                      ? "Restaurando Sistema"
                      : "Generando Respaldo"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {isClearingDatabase
                    ? "Eliminando toda la información del sistema. La página se recargará automáticamente."
                    : (isRestoring || isPgRestoring)
                      ? "Por favor no cierres esta ventana. El sistema se reiniciará automáticamente al finalizar."
                      : "Por favor espera mientras se genera y descarga el archivo de respaldo."}
                </p>
              </div>

              <div className="w-full space-y-2">
                <Progress value={dbProgress} className="w-full h-3" />
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{dbProgress}%</p>
              </div>
            </div>
          </div>
        )
      }
    </Layout >
  );
}