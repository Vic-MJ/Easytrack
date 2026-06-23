import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, Plus, Calendar as CalendarIcon, Edit, Trash2, Users, CheckCircle, 
  ChevronLeft, ChevronRight, List, Kanban, Search, Filter, AlertTriangle, 
  Eye, CalendarDays, CheckCircle2, AlertCircle, XCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { es } from "date-fns/locale";

interface AgendaEvent {
  id: number;
  createdBy: number;
  assignedToArea: string;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: 'alta' | 'media' | 'baja';
  status: 'pendiente' | 'completado' | 'cancelado';
  createdAt: string;
  updatedAt: string;
  creatorName?: string;
}

export default function AgendaPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const monday = new Date(today);
    // Find the Monday of the current week
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    return monday;
  });
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<AgendaEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filterArea, setFilterArea] = useState<string>("todos");
  const [filterPriority, setFilterPriority] = useState<string>("todos");
  const [showWeekends, setShowWeekends] = useState<boolean>(false);

  const canCreateEdit = user?.area === 'admin' || user?.area === 'envios';

  // Helper to format Date to YYYY-MM-DD in local time
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [eventForm, setEventForm] = useState<{
    assignedToArea: string;
    title: string;
    description: string;
    date: string;
    time: string;
    priority: 'alta' | 'media' | 'baja';
    status: 'pendiente' | 'completado' | 'cancelado';
  }>({
    assignedToArea: 'corte',
    title: '',
    description: '',
    date: getLocalDateString(selectedDate),
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    priority: 'media',
    status: 'pendiente'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setEventForm(prev => ({
      ...prev,
      date: getLocalDateString(selectedDate)
    }));
  }, [selectedDate]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/agenda');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingEvent ? `/api/agenda/${editingEvent.id}` : '/api/agenda';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventForm),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: editingEvent ? "Tarea actualizada" : "Tarea creada",
        });
        fetchEvents();
        setShowEventModal(false);
        resetForm();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la tarea",
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = async (eventId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/agenda/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Estado de la tarea actualizado",
        });
        fetchEvents();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (eventId: number) => {
    try {
      const response = await fetch(`/api/agenda/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Tarea eliminada",
        });
        fetchEvents();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la tarea",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setEventForm({
      assignedToArea: 'corte',
      title: '',
      description: '',
      date: getLocalDateString(selectedDate),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      priority: 'media',
      status: 'pendiente'
    });
    setEditingEvent(null);
  };

  const startEdit = (event: AgendaEvent) => {
    setEventForm({
      assignedToArea: event.assignedToArea,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      priority: event.priority,
      status: event.status
    });
    setEditingEvent(event);
    setShowEventModal(true);
  };

  // Generar días de la semana (L-V o L-D)
  const getWeekDays = (weekStart: Date) => {
    const days = [];
    const count = showWeekends ? 7 : 5;
    for (let i = 0; i < count; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeekStart);

  // Navegación de semanas
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const monday = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    setCurrentWeekStart(monday);
  };

  // Filtrado de eventos en memoria
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Si el usuario no es admin/envíos, por defecto ve sus tareas asignadas a menos que filtre
    const userArea = user?.area;
    const isUserAdminOrEnvios = userArea === 'admin' || userArea === 'envios';
    
    let matchesArea = true;
    if (filterArea === 'todos') {
      if (!isUserAdminOrEnvios) {
        matchesArea = event.assignedToArea === userArea;
      }
    } else {
      matchesArea = event.assignedToArea === filterArea;
    }

    const matchesPriority = filterPriority === 'todos' || event.priority === filterPriority;

    return matchesSearch && matchesArea && matchesPriority;
  });

  const getEventsForDate = (date: Date) => {
    const dateStr = getLocalDateString(date);
    return filteredEvents.filter(event => event.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-500 text-red-50 border-red-200';
      case 'media': return 'bg-yellow-500 text-yellow-900 border-yellow-200';
      case 'baja': return 'bg-green-500 text-green-50 border-green-200';
      default: return 'bg-gray-500 text-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50';
      case 'cancelado': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50';
      case 'pendiente': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAreaDisplayName = (area: string) => {
    const names: Record<string, string> = {
      patronaje: 'Patronaje',
      corte: 'Corte',
      bordado: 'Bordado',
      ensamble: 'Ensamble',
      plancha: 'Plancha/Empaque',
      calidad: 'Calidad',
      maquilas: 'Maquilas',
      envios: 'Envíos',
      admin: 'Administración',
      operaciones: 'Operaciones',
      almacen: 'Almacén',
      diseño: 'Diseño'
    };
    return names[area] || area;
  };

  const formatDisplayTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('es-MX', { weekday: 'long' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Métricas rápidas
  const todayStr = getLocalDateString(new Date());
  const metrics = {
    total: filteredEvents.length,
    pending: filteredEvents.filter(e => e.status === 'pendiente').length,
    completed: filteredEvents.filter(e => e.status === 'completado').length,
    overdue: filteredEvents.filter(e => e.status === 'pendiente' && e.date < todayStr).length
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Sistema de Asignación de Tareas
            </h1>
            <p className="text-muted-foreground mt-1">
              {canCreateEdit
                ? 'Gestiona y asigna tareas a las diferentes áreas de producción'
                : `Tareas asignadas al área de ${getAreaDisplayName(user?.area || '')}`
              }
            </p>
          </div>
          {canCreateEdit && (
            <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="shadow-md transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/95 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Tarea
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">
                    {editingEvent ? 'Editar Tarea' : 'Nueva Tarea'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="assignedToArea">Asignar a Área</Label>
                    <Select
                      value={eventForm.assignedToArea}
                      onValueChange={(value) => setEventForm({ ...eventForm, assignedToArea: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patronaje">Patronaje</SelectItem>
                        <SelectItem value="corte">Corte</SelectItem>
                        <SelectItem value="bordado">Bordado</SelectItem>
                        <SelectItem value="ensamble">Ensamble</SelectItem>
                        <SelectItem value="plancha">Plancha/Empaque</SelectItem>
                        <SelectItem value="calidad">Calidad</SelectItem>
                        <SelectItem value="maquilas">Maquilas</SelectItem>
                        <SelectItem value="operaciones">Operaciones</SelectItem>
                        <SelectItem value="almacen">Almacén</SelectItem>
                        <SelectItem value="diseño">Diseño</SelectItem>
                        <SelectItem value="envios">Envíos</SelectItem>
                        <SelectItem value="admin">Administración</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Título de la Tarea</Label>
                    <Input
                      id="title"
                      className="mt-1"
                      placeholder="Ej. Revisión de muestrarios"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      className="mt-1"
                      placeholder="Detalles de la tarea..."
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="date">Fecha</Label>
                      <Input
                        id="date"
                        type="date"
                        className="mt-1"
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Hora</Label>
                      <Input
                        id="time"
                        type="time"
                        className="mt-1"
                        value={eventForm.time}
                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="priority">Prioridad</Label>
                      <Select
                        value={eventForm.priority}
                        onValueChange={(value: any) => setEventForm({ ...eventForm, priority: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="baja">Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Estado</Label>
                      <Select
                        value={eventForm.status}
                        onValueChange={(value: any) => setEventForm({ ...eventForm, status: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                          <SelectItem value="completado">Completado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setShowEventModal(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/95 text-white">
                      {editingEvent ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Panel de KPIs / Métricas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm transition-transform hover:translate-y-[-2px]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tareas</p>
                <h3 className="text-2xl font-bold mt-1">{metrics.total}</h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded-full text-blue-600 dark:text-blue-400">
                <CalendarDays className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-sm transition-transform hover:translate-y-[-2px]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <h3 className="text-2xl font-bold mt-1">{metrics.pending}</h3>
              </div>
              <div className="bg-amber-100 dark:bg-amber-950 p-2 rounded-full text-amber-600 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 shadow-sm transition-transform hover:translate-y-[-2px]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                <h3 className="text-2xl font-bold mt-1">{metrics.completed}</h3>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-950 p-2 rounded-full text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className={`border-l-4 shadow-sm transition-transform hover:translate-y-[-2px] ${metrics.overdue > 0 ? 'border-l-rose-500 animate-pulse' : 'border-l-gray-400'}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencidas</p>
                <h3 className={`text-2xl font-bold mt-1 ${metrics.overdue > 0 ? 'text-rose-600 dark:text-rose-400' : ''}`}>{metrics.overdue}</h3>
              </div>
              <div className={`p-2 rounded-full ${metrics.overdue > 0 ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400' : 'bg-gray-100 dark:bg-gray-900 text-gray-500'}`}>
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
              {/* Buscador */}
              <div className="w-full md:w-1/3 space-y-1.5">
                <Label htmlFor="search" className="text-xs font-semibold uppercase text-muted-foreground">Buscar Tarea</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por título o descripción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-4 w-full md:w-auto items-end justify-start md:justify-end">
                {/* Filtro de Área */}
                <div className="space-y-1.5 w-[160px]">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                    <Filter className="h-3 w-3" /> Área
                  </Label>
                  <Select value={filterArea} onValueChange={setFilterArea}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los Áreas</SelectItem>
                      <SelectItem value="patronaje">Patronaje</SelectItem>
                      <SelectItem value="corte">Corte</SelectItem>
                      <SelectItem value="bordado">Bordado</SelectItem>
                      <SelectItem value="ensamble">Ensamble</SelectItem>
                      <SelectItem value="plancha">Plancha/Empaque</SelectItem>
                      <SelectItem value="calidad">Calidad</SelectItem>
                      <SelectItem value="maquilas">Maquilas</SelectItem>
                      <SelectItem value="operaciones">Operaciones</SelectItem>
                      <SelectItem value="almacen">Almacén</SelectItem>
                      <SelectItem value="diseño">Diseño</SelectItem>
                      <SelectItem value="envios">Envíos</SelectItem>
                      <SelectItem value="admin">Administración</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de Prioridad */}
                <div className="space-y-1.5 w-[140px]">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Prioridad</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Switch Fines de semana */}
                <div className="flex items-center space-x-2 h-10">
                  <input
                    type="checkbox"
                    id="weekends-toggle"
                    checked={showWeekends}
                    onChange={(e) => setShowWeekends(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <Label htmlFor="weekends-toggle" className="text-sm font-medium cursor-pointer">
                    Ver fin de semana
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cuerpo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Barra Lateral: Calendario */}
          <Card className="lg:col-span-1 shadow-sm h-fit">
            <CardHeader className="pb-3 px-4">
              <CardTitle className="flex items-center text-md font-bold text-foreground">
                <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                Calendario
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4 pt-0 flex flex-col items-center">
              <div className="w-full max-w-[270px] overflow-hidden flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  locale={es}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      // Actualizar la semana del calendario para que contenga esta fecha elegida
                      const monday = new Date(date);
                      const day = date.getDay();
                      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                      monday.setDate(diff);
                      setCurrentWeekStart(monday);
                    }
                  }}
                  className="p-1 w-full"
                  modifiers={{
                    hasEvent: (date) => events.some(e => e.date === getLocalDateString(date))
                  }}
                  modifiersStyles={{
                    hasEvent: { 
                      borderBottom: '3px solid hsl(var(--primary))', 
                      fontWeight: 'bold',
                      borderRadius: '4px'
                    }
                  }}
                />
              </div>
              <div className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-1.5 px-2 text-center">
                <span className="w-2.5 h-1.5 bg-primary rounded-full block shrink-0"></span>
                <span>Días subrayados tienen tareas</span>
              </div>
            </CardContent>
          </Card>

          {/* Área de Vistas (Tabs) */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="semanal" className="w-full">
              <div className="flex justify-between items-center mb-4 bg-muted/30 p-1 rounded-lg border">
                <TabsList className="bg-transparent border-0 gap-1">
                  <TabsTrigger value="semanal" className="data-[state=active]:bg-background flex items-center gap-1.5 py-1.5">
                    <Clock className="h-4 w-4" />
                    Vista Semanal
                  </TabsTrigger>
                  <TabsTrigger value="lista" className="data-[state=active]:bg-background flex items-center gap-1.5 py-1.5">
                    <List className="h-4 w-4" />
                    Lista
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="data-[state=active]:bg-background flex items-center gap-1.5 py-1.5">
                    <Kanban className="h-4 w-4" />
                    Tablero Kanban
                  </TabsTrigger>
                </TabsList>

                {/* Navegación Semanal Rápida */}
                <div className="flex items-center space-x-1.5 pr-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background" onClick={goToPreviousWeek} title="Semana anterior">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 px-3 font-medium bg-background text-xs" onClick={goToCurrentWeek}>
                    Hoy
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background" onClick={goToNextWeek} title="Siguiente semana">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Contenido: Vista Semanal */}
              <TabsContent value="semanal" className="outline-none">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        Semana de Trabajo
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {currentWeekStart.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} - {weekDays[weekDays.length - 1].toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 overflow-x-auto">
                    {loading ? (
                      <div className="flex justify-center items-center py-12 text-sm text-muted-foreground">Cargando tareas...</div>
                    ) : (
                      <div className={`grid ${showWeekends ? 'grid-cols-7' : 'grid-cols-5'} gap-3 min-w-[750px]`}>
                        {weekDays.map((day, index) => {
                          const dayEvents = getEventsForDate(day);
                          const dayName = getDayName(day).charAt(0).toUpperCase() + getDayName(day).slice(1);

                          return (
                            <div key={index} className={`border rounded-lg overflow-hidden min-h-[350px] flex flex-col transition-all duration-200 ${isToday(day)
                              ? 'bg-blue-50/45 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-sm'
                              : 'bg-card border-border'
                              }`}>
                              {/* Header del día */}
                              <div className={`text-center py-2.5 border-b transition-colors duration-200 ${isToday(day)
                                ? 'bg-blue-100/60 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800'
                                : 'bg-muted/40 border-border'
                                }`}>
                                <div className={`text-xs font-bold uppercase tracking-wider ${isToday(day) ? 'text-blue-700 dark:text-blue-300' : 'text-muted-foreground'}`}>
                                  {dayName}
                                </div>
                                <div className={`text-xl font-extrabold mt-0.5 ${isToday(day) ? 'text-blue-800 dark:text-blue-200' : 'text-foreground'}`}>
                                  {day.getDate()}
                                </div>
                              </div>

                              {/* Lista de tareas */}
                              <div className="p-2.5 space-y-2 flex-grow overflow-y-auto max-h-[350px]">
                                {dayEvents.map((event) => (
                                  <div
                                    key={event.id}
                                    className="bg-card border border-border/80 rounded-md p-2.5 shadow-sm hover:shadow-md cursor-pointer group transition-all duration-150 hover:border-primary/50 relative overflow-hidden"
                                    onClick={() => setViewingEvent(event)}
                                  >
                                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary" style={{ backgroundColor: event.priority === 'alta' ? 'rgb(239, 68, 68)' : event.priority === 'media' ? 'rgb(234, 179, 8)' : 'rgb(34, 197, 94)' }}></div>
                                    
                                    {/* Header de la tarjeta */}
                                    <div className="flex items-center justify-between mb-1.5 pl-1.5">
                                      <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        {formatDisplayTime(event.time)}
                                      </span>
                                      <Badge className={`${getStatusColor(event.status)} text-[9px] px-1.5 py-0 border font-bold capitalize`}>
                                        {event.status}
                                      </Badge>
                                    </div>

                                    {/* Título */}
                                    <div className="font-semibold text-foreground text-xs leading-tight mb-2 pl-1.5 line-clamp-2">
                                      {event.title}
                                    </div>

                                    {/* Footer con Área */}
                                    <div className="flex items-center justify-between mt-2 pl-1.5">
                                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                                        {getAreaDisplayName(event.assignedToArea)}
                                      </span>

                                      {/* Acciones flotantes */}
                                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {canCreateEdit ? (
                                          <>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                startEdit(event);
                                              }}
                                              className="h-5 w-5 hover:bg-blue-100 text-blue-600 dark:hover:bg-blue-950"
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(event.id);
                                              }}
                                              className="h-5 w-5 hover:bg-red-100 text-red-600 dark:hover:bg-red-950"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </>
                                        ) : (
                                          event.assignedToArea === user?.area && event.status === 'pendiente' && (
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleStatusUpdate(event.id, 'completado');
                                              }}
                                              className="h-5 w-5 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950"
                                              title="Marcar completada"
                                            >
                                              <CheckCircle className="h-3 w-3" />
                                            </Button>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {dayEvents.length === 0 && (
                                  <div className="text-muted-foreground text-center text-[10px] py-12 italic">
                                    Sin tareas
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contenido: Vista de Lista */}
              <TabsContent value="lista" className="outline-none">
                <Card className="shadow-sm">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-muted/60 text-muted-foreground font-semibold text-xs border-b">
                            <th className="p-3 pl-4">Prioridad</th>
                            <th className="p-3">Título</th>
                            <th className="p-3">Área Asignada</th>
                            <th className="p-3">Fecha y Hora</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3 text-right pr-6">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredEvents.length > 0 ? (
                            filteredEvents.sort((a,b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)).map((event) => (
                              <tr 
                                key={event.id} 
                                className="hover:bg-muted/30 transition-colors cursor-pointer group"
                                onClick={() => setViewingEvent(event)}
                              >
                                <td className="p-3 pl-4">
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${
                                    event.priority === 'alta' ? 'bg-red-50 text-red-700 border-red-200' :
                                    event.priority === 'media' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    'bg-green-50 text-green-700 border-green-200'
                                  }`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                    {event.priority}
                                  </span>
                                </td>
                                <td className="p-3 font-semibold text-foreground">
                                  <div>
                                    <p className="line-clamp-1">{event.title}</p>
                                    {event.description && <p className="text-xs text-muted-foreground font-normal line-clamp-1 mt-0.5">{event.description}</p>}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <Badge variant="outline" className="font-semibold text-[11px] bg-muted/50">
                                    {getAreaDisplayName(event.assignedToArea)}
                                  </Badge>
                                </td>
                                <td className="p-3 font-medium text-xs">
                                  <span className="flex items-center gap-1.5">
                                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    {event.date}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-muted-foreground mt-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {formatDisplayTime(event.time)}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <Badge className={`${getStatusColor(event.status)} text-[10px] px-2 py-0.5 font-bold uppercase border`}>
                                    {event.status}
                                  </Badge>
                                </td>
                                <td className="p-3 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-end gap-1.5">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => setViewingEvent(event)}
                                      className="h-8 w-8 hover:bg-muted"
                                      title="Ver Detalles"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {canCreateEdit ? (
                                      <>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => startEdit(event)}
                                          className="h-8 w-8 hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-950"
                                          title="Editar"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => handleDelete(event.id)}
                                          className="h-8 w-8 hover:bg-red-50 text-red-600 dark:hover:bg-red-950"
                                          title="Eliminar"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </>
                                    ) : (
                                      event.assignedToArea === user?.area && event.status === 'pendiente' && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleStatusUpdate(event.id, 'completado')}
                                          className="h-8 text-xs text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700"
                                        >
                                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                          Completar
                                        </Button>
                                      )
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm italic">
                                No se encontraron tareas con los filtros aplicados.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contenido: Tablero Kanban */}
              <TabsContent value="kanban" className="outline-none">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Columna Pendientes */}
                  <div className="space-y-3">
                    <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/40 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                        <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300 uppercase">Pendientes</h4>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">{filteredEvents.filter(e => e.status === 'pendiente').length}</Badge>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {filteredEvents.filter(e => e.status === 'pendiente').map(event => (
                        <Card 
                          key={event.id} 
                          className="shadow-sm hover:shadow-md cursor-pointer border-l-4 border-l-amber-500 hover:border-primary/50 transition-all"
                          onClick={() => setViewingEvent(event)}
                        >
                          <CardContent className="p-3.5 space-y-3">
                            <div className="flex justify-between items-center">
                              <Badge className={`${getPriorityColor(event.priority)} text-[9px] px-2 py-0.5 border font-bold capitalize`}>
                                Prioridad {event.priority}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDisplayTime(event.time)}
                              </span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-sm leading-snug line-clamp-2">{event.title}</h5>
                              {event.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{event.description}</p>}
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t text-xs">
                              <span className="font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground border">
                                {getAreaDisplayName(event.assignedToArea)}
                              </span>
                              <span className="text-muted-foreground text-[10px]">{event.date}</span>
                            </div>

                            {/* Botones de Cambio rápido */}
                            <div className="flex gap-2 justify-end pt-1" onClick={e => e.stopPropagation()}>
                              {canCreateEdit ? (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 text-[10px] border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                                    onClick={() => handleStatusUpdate(event.id, 'completado')}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" /> Completar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 text-[10px] border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                                    onClick={() => handleStatusUpdate(event.id, 'cancelado')}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" /> Cancelar
                                  </Button>
                                </>
                              ) : (
                                event.assignedToArea === user?.area && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 w-full text-[10px] border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                                    onClick={() => handleStatusUpdate(event.id, 'completado')}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" /> Completar Tarea
                                  </Button>
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filteredEvents.filter(e => e.status === 'pendiente').length === 0 && (
                        <div className="text-center py-8 text-xs text-muted-foreground italic bg-muted/20 border border-dashed rounded-lg">
                          No hay tareas pendientes
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Columna Completados */}
                  <div className="space-y-3">
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/40 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 uppercase">Completados</h4>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">{filteredEvents.filter(e => e.status === 'completado').length}</Badge>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {filteredEvents.filter(e => e.status === 'completado').map(event => (
                        <Card 
                          key={event.id} 
                          className="shadow-sm hover:shadow-md cursor-pointer border-l-4 border-l-emerald-500 hover:border-primary/50 transition-all opacity-85"
                          onClick={() => setViewingEvent(event)}
                        >
                          <CardContent className="p-3.5 space-y-3">
                            <div className="flex justify-between items-center">
                              <Badge className={`${getPriorityColor(event.priority)} text-[9px] px-2 py-0.5 border font-bold capitalize`}>
                                Prioridad {event.priority}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDisplayTime(event.time)}
                              </span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-sm leading-snug line-clamp-2 text-muted-foreground line-through">{event.title}</h5>
                              {event.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{event.description}</p>}
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t text-xs">
                              <span className="font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground border">
                                {getAreaDisplayName(event.assignedToArea)}
                              </span>
                              <span className="text-muted-foreground text-[10px]">{event.date}</span>
                            </div>

                            {/* Volver a Pendiente */}
                            {canCreateEdit && (
                              <div className="flex justify-end pt-1" onClick={e => e.stopPropagation()}>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 text-[10px] hover:bg-muted"
                                  onClick={() => handleStatusUpdate(event.id, 'pendiente')}
                                >
                                  Reabrir tarea
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      {filteredEvents.filter(e => e.status === 'completado').length === 0 && (
                        <div className="text-center py-8 text-xs text-muted-foreground italic bg-muted/20 border border-dashed rounded-lg">
                          No hay tareas completadas
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Columna Cancelados */}
                  <div className="space-y-3">
                    <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/40 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                        <h4 className="font-bold text-sm text-rose-800 dark:text-rose-300 uppercase">Cancelados</h4>
                      </div>
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">{filteredEvents.filter(e => e.status === 'cancelado').length}</Badge>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {filteredEvents.filter(e => e.status === 'cancelado').map(event => (
                        <Card 
                          key={event.id} 
                          className="shadow-sm hover:shadow-md cursor-pointer border-l-4 border-l-rose-500 hover:border-primary/50 transition-all opacity-75"
                          onClick={() => setViewingEvent(event)}
                        >
                          <CardContent className="p-3.5 space-y-3">
                            <div className="flex justify-between items-center">
                              <Badge className={`${getPriorityColor(event.priority)} text-[9px] px-2 py-0.5 border font-bold capitalize`}>
                                Prioridad {event.priority}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDisplayTime(event.time)}
                              </span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-sm leading-snug line-clamp-2 text-muted-foreground line-through">{event.title}</h5>
                              {event.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{event.description}</p>}
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t text-xs">
                              <span className="font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground border">
                                {getAreaDisplayName(event.assignedToArea)}
                              </span>
                              <span className="text-muted-foreground text-[10px]">{event.date}</span>
                            </div>

                            {/* Volver a Pendiente */}
                            {canCreateEdit && (
                              <div className="flex justify-end pt-1" onClick={e => e.stopPropagation()}>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 text-[10px] hover:bg-muted"
                                  onClick={() => handleStatusUpdate(event.id, 'pendiente')}
                                >
                                  Reabrir tarea
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      {filteredEvents.filter(e => e.status === 'cancelado').length === 0 && (
                        <div className="text-center py-8 text-xs text-muted-foreground italic bg-muted/20 border border-dashed rounded-lg">
                          No hay tareas canceladas
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Dialog para Ver Detalles de Tarea */}
      <Dialog open={viewingEvent !== null} onOpenChange={(open) => !open && setViewingEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full`} style={{ backgroundColor: viewingEvent?.priority === 'alta' ? 'rgb(239, 68, 68)' : viewingEvent?.priority === 'media' ? 'rgb(234, 179, 8)' : 'rgb(34, 197, 94)' }} />
              Detalle de Tarea
            </DialogTitle>
          </DialogHeader>
          {viewingEvent && (
            <div className="space-y-4 pt-4">
              <div>
                <h3 className="text-lg font-bold text-foreground leading-tight">{viewingEvent.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="font-bold text-[11px]">
                    Área: {getAreaDisplayName(viewingEvent.assignedToArea)}
                  </Badge>
                  <Badge className={`${getPriorityColor(viewingEvent.priority)} text-white font-semibold text-[10px] capitalize`}>
                    Prioridad {viewingEvent.priority}
                  </Badge>
                  <Badge className={`${getStatusColor(viewingEvent.status)} text-[10px] font-bold capitalize border`}>
                    {viewingEvent.status}
                  </Badge>
                </div>
              </div>

              {viewingEvent.description ? (
                <div className="bg-muted/50 p-3.5 rounded-lg border border-border">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Descripción</h4>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{viewingEvent.description}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Sin descripción detallada.</p>
              )}

              <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wider">Fecha programada</span>
                  <span className="font-semibold flex items-center gap-1.5 mt-1">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {viewingEvent.date}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs font-medium uppercase tracking-wider">Hora programada</span>
                  <span className="font-semibold flex items-center gap-1.5 mt-1">
                    <Clock className="h-4 w-4 text-primary" />
                    {formatDisplayTime(viewingEvent.time)}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 border-t pt-4 mt-2">
                <Button variant="outline" onClick={() => setViewingEvent(null)}>
                  Cerrar
                </Button>
                {canCreateEdit && (
                  <Button onClick={() => {
                    const ev = viewingEvent;
                    setViewingEvent(null);
                    startEdit(ev);
                  }} className="bg-primary hover:bg-primary/95 text-white">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Tarea
                  </Button>
                )}
                {!canCreateEdit && viewingEvent.assignedToArea === user?.area && viewingEvent.status === 'pendiente' && (
                  <Button onClick={() => {
                    handleStatusUpdate(viewingEvent.id, 'completado');
                    setViewingEvent(null);
                  }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Completada
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
