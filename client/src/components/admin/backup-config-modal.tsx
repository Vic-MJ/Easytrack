import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  Clock, 
  Calendar, 
  Save, 
  Download, 
  History, 
  Trash2, 
  Loader2,
  Settings2,
  HardDrive
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BackupFile {
  filename: string;
  size: number;
  createdAt: string;
}

interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  hour: number;
  minute: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  keepLast: number;
}

interface BackupConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BackupConfigModal({ open, onOpenChange }: BackupConfigModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados locales para el formulario
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hour, setHour] = useState(3);
  const [minute, setMinute] = useState(0);
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [keepLast, setKeepLast] = useState(10);

  // Obtener configuración
  const { data: config, isLoading: isLoadingConfig } = useQuery<BackupConfig>({
    queryKey: ["/api/admin/backup-config"],
    enabled: open
  });

  // Obtener lista de respaldos
  const { data: backups, isLoading: isLoadingBackups } = useQuery<BackupFile[]>({
    queryKey: ["/api/admin/backups/auto"],
    enabled: open
  });

  // Efecto para cargar datos en el formulario
  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setFrequency(config.frequency);
      setHour(config.hour);
      setMinute(config.minute);
      setDayOfWeek(config.dayOfWeek || 0);
      setDayOfMonth(config.dayOfMonth || 1);
      setKeepLast(config.keepLast || 10);
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: async (newConfig: BackupConfig) => {
      const res = await fetch("/api/admin/backup-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      if (!res.ok) throw new Error("Error al guardar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backup-config"] });
      toast({ title: "Configuración guardada", description: "Los cambios se aplicarán en la próxima programación." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo guardar la configuración", variant: "destructive" });
    }
  });

  const handleSave = () => {
    saveMutation.mutate({
      enabled,
      frequency,
      hour,
      minute,
      dayOfWeek,
      dayOfMonth,
      keepLast
    });
  };

  const downloadBackup = (filename: string) => {
    window.open(`/api/admin/backups/auto/${filename}`, '_blank');
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
              <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <DialogTitle className="text-xl">Respaldos Automáticos</DialogTitle>
          </div>
          <DialogDescription>
            Configura la frecuencia y el horario en que el sistema realizará copias de seguridad de la base de datos automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Interruptor Principal */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="space-y-0.5">
              <Label className="text-base font-bold">Estado del Servicio</Label>
              <p className="text-xs text-slate-500">Activa o desactiva la ejecución de tareas programadas</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frecuencia */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Calendar className="w-3.5 h-3.5" /> Frecuencia
                  </Label>
                  <Select value={frequency} onValueChange={(val: any) => setFrequency(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Horario */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Clock className="w-3.5 h-3.5" /> Hora de ejecución
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Select value={hour.toString()} onValueChange={(v) => setHour(parseInt(v))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}:00</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-slate-400">:</span>
                    <Select value={minute.toString()} onValueChange={(v) => setMinute(parseInt(v))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">00</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="45">45</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {frequency === 'weekly' && (
                <div className="space-y-2 animate-in zoom-in-95 duration-200">
                  <Label className="text-xs font-bold text-slate-500">Día de la semana</Label>
                  <Select value={dayOfWeek.toString()} onValueChange={(v) => setDayOfWeek(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Domingo</SelectItem>
                      <SelectItem value="1">Lunes</SelectItem>
                      <SelectItem value="2">Martes</SelectItem>
                      <SelectItem value="3">Miércoles</SelectItem>
                      <SelectItem value="4">Jueves</SelectItem>
                      <SelectItem value="5">Viernes</SelectItem>
                      <SelectItem value="6">Sábado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {frequency === 'monthly' && (
                <div className="space-y-2 animate-in zoom-in-95 duration-200">
                  <Label className="text-xs font-bold text-slate-500">Día del mes</Label>
                  <Select value={dayOfMonth.toString()} onValueChange={(v) => setDayOfMonth(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }).map((_, i) => (
                        <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Settings2 className="w-3.5 h-3.5" /> Retención
                </Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    min="1" 
                    max="50" 
                    value={keepLast} 
                    onChange={(e) => setKeepLast(parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-xs text-slate-500">Mantener los últimos {keepLast} respaldos en el servidor.</span>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Respaldos Recientes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                Historial de Respaldos (Host Local)
              </h4>
              <div className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                AUTO-SAVE
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {isLoadingBackups ? (
                <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs">Cargando archivos...</span>
                </div>
              ) : backups && backups.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[200px] overflow-y-auto">
                  {backups.map((file) => (
                    <div key={file.filename} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                          <HardDrive className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold truncate max-w-[200px]">{file.filename}</p>
                          <p className="text-[10px] text-slate-500">
                            {format(new Date(file.createdAt), "PPP p", { locale: es })} • {formatSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        onClick={() => downloadBackup(file.filename)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500">No hay respaldos automáticos disponibles aún.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Guardar Configuración
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
