import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, TrendingUp, Users, AlertTriangle, FileText, BarChart3, Target, Calendar, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'];

export default function MetricsPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  if (user?.area !== 'admin') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <Card className="max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Acceso Denegado</h2>
              <p className="text-gray-600">Solo los administradores pueden acceder a las métricas del sistema.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const { data: monthlyMetrics, isLoading: monthlyLoading, error: monthlyError } = useQuery<any>({
    queryKey: ['metrics', 'monthly', selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/metrics/monthly?month=${selectedMonth}&year=${selectedYear}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar métricas mensuales');
      }
      return response.json();
    },
    retry: 2,
    retryDelay: 500,
    staleTime: 30000,
    gcTime: 300000
  });

  const { data: overallMetrics, isLoading: overallLoading, error: overallError } = useQuery<any>({
    queryKey: ['metrics', 'overall'],
    queryFn: async () => {
      const response = await fetch('/api/metrics/overall');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar métricas generales');
      }
      return response.json();
    },
    retry: 2,
    retryDelay: 500,
    staleTime: 60000,
    gcTime: 600000
  });

  const { data: requestAnalysis, isLoading: requestLoading, error: requestError } = useQuery<any>({
    queryKey: ['metrics', 'requests'],
    queryFn: async () => {
      const response = await fetch('/api/metrics/requests');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar análisis de solicitudes');
      }
      return response.json();
    },
    retry: 2,
    retryDelay: 500,
    staleTime: 45000,
    gcTime: 450000
  });

  const handleExport = async (type: 'monthly' | 'overall' | 'requests' | 'causativeArea') => {
    try {
      const params = (type === 'monthly' || type === 'causativeArea') ? `?month=${selectedMonth}&year=${selectedYear}` : '';
      const response = await fetch(`/api/metrics/export/${type}${params}`);

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `metricas-${type}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  const currentMonthName = new Date(parseInt(selectedYear), parseInt(selectedMonth)).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const getAreaDisplayName = (areaKey: string): string => {
    const areaMap: { [key: string]: string } = {
      'R&D': 'Investigación y Desarrollo',
      'Production': 'Producción',
      'Quality Assurance': 'Control de Calidad',
      'maquilas': 'Maquilas',
      'Sales': 'Ventas',
      'Marketing': 'Marketing',
      'Human Resources': 'Recursos Humanos',
      'Finance': 'Finanzas',
      'Operations': 'Operaciones',
      'IT': 'Tecnologías de la Información',
      'Customer Support': 'Soporte al Cliente'
    };
    return areaMap[areaKey] || areaKey;
  };


  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Mejorado */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-white/20 dark:bg-white/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <BarChart3 className="text-white text-3xl" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2 text-white">Centro de Métricas</h1>
                    <p className="text-blue-100 dark:text-blue-200 text-lg">Análisis inteligente y estadísticas avanzadas</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-blue-100 dark:text-blue-200">Última actualización</div>
                    <div className="text-white font-semibold">{new Date().toLocaleDateString('es-ES')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros Mejorados */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Período:</span>
                  </div>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-48 border-2 border-blue-200 dark:border-slate-600 focus:border-blue-500 rounded-lg dark:bg-slate-800">
                      <SelectValue placeholder="Seleccionar mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {new Date(0, i).toLocaleDateString('es-ES', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32 border-2 border-blue-200 dark:border-slate-600 focus:border-blue-500 rounded-lg dark:bg-slate-800">
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 3 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/30 flex items-center gap-2 font-semibold">
                        <Activity size={16} />
                        Ver detalles completos
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-2xl rounded-2xl p-6">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
                          <Activity className="text-blue-600" />
                          Detalles Completos (Histórico)
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 space-y-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Resumen general e histórico acumulado de todas las reposiciones y reprocesos registrados en el sistema.
                        </p>
                        
                        {overallLoading ? (
                          <div className="grid grid-cols-2 gap-4 animate-pulse">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div key={i} className="h-24 bg-gray-100 dark:bg-slate-800 rounded-xl"></div>
                            ))}
                          </div>
                        ) : overallError ? (
                          <p className="text-red-500 text-center py-4">Error al cargar detalles: {overallError.message}</p>
                        ) : overallMetrics ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              {
                                title: "Total Reposiciones",
                                value: overallMetrics.totalRepositions,
                                description: "Total acumulado de reposiciones",
                                icon: FileText,
                                bgColor: "bg-blue-50 dark:bg-blue-950/30",
                                textColor: "text-blue-600 dark:text-blue-400"
                              },
                              {
                                title: "Total Piezas",
                                value: overallMetrics.totalPieces,
                                description: "Total de piezas afectadas",
                                icon: Users,
                                bgColor: "bg-green-50 dark:bg-green-950/30",
                                textColor: "text-green-600 dark:text-green-400"
                              },
                              {
                                title: "Área Más Activa",
                                value: getAreaDisplayName(overallMetrics.mostActiveArea),
                                description: "Área con mayor incidencia",
                                icon: Target,
                                bgColor: "bg-purple-50 dark:bg-purple-950/30",
                                textColor: "text-purple-600 dark:text-purple-400"
                              },
                              {
                                title: "Promedio Mensual",
                                value: overallMetrics.monthlyAverage,
                                description: "Media de solicitudes por mes",
                                icon: TrendingUp,
                                bgColor: "bg-orange-50 dark:bg-orange-950/30",
                                textColor: "text-orange-600 dark:text-orange-400"
                              }
                            ].map((item, index) => (
                              <div key={index} className={`p-4 rounded-xl ${item.bgColor} border border-transparent dark:border-slate-800 flex items-center justify-between`}>
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.title}</p>
                                  <p className="text-2xl font-bold text-gray-950 dark:text-white">{item.value}</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500">{item.description}</p>
                                </div>
                                <div className={`p-3 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${item.textColor}`}>
                                  <item.icon size={24} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
                          <Button onClick={() => handleExport('overall')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center gap-2 font-semibold">
                            <Download size={16} />
                            Exportar Reporte General
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas Mensuales del Período - Tarjetas Mejoradas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {monthlyLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
                  </CardContent>
                </Card>
              ))
            ) : monthlyError ? (
              <div className="col-span-full text-center py-8 text-red-500">
                Error al cargar métricas del mes: {monthlyError.message}
              </div>
            ) : monthlyMetrics ? (
              [
                {
                  title: "Reposiciones del Mes",
                  value: monthlyMetrics.totalReposiciones ?? 0,
                  icon: FileText,
                  gradient: "from-blue-500 to-blue-600",
                  bgColor: "bg-blue-50",
                  iconColor: "text-blue-600"
                },
                {
                  title: "Reprocesos del Mes",
                  value: monthlyMetrics.totalReprocesos ?? 0,
                  icon: AlertTriangle,
                  gradient: "from-red-500 to-red-600",
                  bgColor: "bg-red-50",
                  iconColor: "text-red-600"
                },
                {
                  title: "Piezas del Mes",
                  value: monthlyMetrics.totalPieces ?? 0,
                  icon: Users,
                  gradient: "from-green-500 to-green-600",
                  bgColor: "bg-green-50",
                  iconColor: "text-green-600"
                },
                {
                  title: "Área Más Activa",
                  value: getAreaDisplayName(monthlyMetrics.mostActiveArea || "N/A"),
                  icon: Target,
                  gradient: "from-purple-500 to-purple-600",
                  bgColor: "bg-purple-50",
                  iconColor: "text-purple-600"
                }
              ].map((metric, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white dark:bg-slate-800 dark:border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{metric.title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                      </div>
                      <div className={`w-14 h-14 ${metric.bgColor} dark:bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <metric.icon className={`${metric.iconColor} text-2xl`} size={28} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : null}
          </div>

          <Tabs defaultValue="areas" className="w-full space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:max-w-3xl bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl h-auto gap-1 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <TabsTrigger 
                value="areas" 
                className="rounded-lg py-2.5 px-3 flex items-center justify-center gap-2 text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <BarChart3 className="h-4 w-4" />
                Áreas Solicitantes
              </TabsTrigger>
              <TabsTrigger 
                value="causes" 
                className="rounded-lg py-2.5 px-3 flex items-center justify-center gap-2 text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 data-[state=active]:shadow-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <AlertTriangle className="h-4 w-4" />
                Causas de Daño
              </TabsTrigger>
              <TabsTrigger 
                value="causative" 
                className="rounded-lg py-2.5 px-3 flex items-center justify-center gap-2 text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-yellow-400 data-[state=active]:shadow-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Target className="h-4 w-4" />
                Áreas Responsables
              </TabsTrigger>
              <TabsTrigger 
                value="requests" 
                className="rounded-lg py-2.5 px-3 flex items-center justify-center gap-2 text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <FileText className="h-4 w-4" />
                Por Solicitud
              </TabsTrigger>
            </TabsList>

            <TabsContent value="areas" className="space-y-6 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Activity className="h-6 w-6" />
                  <CardTitle className="text-2xl">Análisis de {currentMonthName}</CardTitle>
                </div>
                <Button
                  onClick={() => handleExport('monthly')}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {monthlyLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : monthlyError ? (
                <div className="text-center py-16">
                  <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <p className="text-red-600 text-lg font-medium">{monthlyError.message}</p>
                </div>
              ) : monthlyMetrics ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Gráfico de barras mejorado */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Reposiciones por Área
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={monthlyMetrics.byArea}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-600" />
                        <XAxis
                          dataKey="area"
                          tick={{ fontSize: 12, fill: 'currentColor' }}
                          className="text-gray-700 dark:text-white"
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: 'currentColor' }}
                          className="text-gray-700 dark:text-white"
                        />

                        <Bar dataKey="count" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Gráfico de pastel mejorado */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Distribución Porcentual</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={monthlyMetrics.byArea}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ area, percentage }) => `${area}: ${percentage}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {monthlyMetrics.byArea.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>

                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tarjetas de estadísticas mejoradas */}
                  <div className="xl:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Estadísticas Detalladas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {monthlyMetrics.byArea.map((area: any, index: number) => (
                        <Card key={area.area} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 dark:border-slate-700">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{getAreaDisplayName(area.area)}</p>
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{area.count} reposiciones</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge
                                  style={{
                                    backgroundColor: COLORS[index % COLORS.length],
                                    fontSize: '16px',
                                    padding: '8px 12px'
                                  }}
                                  className="text-white font-bold"
                                >
                                  {area.percentage}%
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg">No hay datos disponibles para este período</p>
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="causes" className="space-y-6 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none">
            {monthlyMetrics?.byCause ? (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700">
              <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center">
                  <AlertTriangle className="h-6 w-6 mr-3" />
                  Análisis de Causas de Daño - {currentMonthName}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Distribución de Causas</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={monthlyMetrics.byCause}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-600" />
                        <XAxis
                          dataKey="cause"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fontSize: 11, fill: 'currentColor' }}
                          className="text-gray-700 dark:text-white"
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: 'currentColor' }}
                          className="text-gray-700 dark:text-white"
                        />

                        <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Ranking de Causas</h3>
                    <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                      {monthlyMetrics.byCause.map((cause: any, index: number) => (
                        <div key={cause.cause} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm`} style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{cause.cause}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{cause.count}</span>
                            <Badge variant="outline" className="text-sm font-semibold">
                              {cause.percentage}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            ) : (
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/50 p-8 text-center text-slate-500">
                No hay datos de causas disponibles para este período.
              </Card>
            )}
          </TabsContent>

          <TabsContent value="causative" className="space-y-6 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none">
            {monthlyMetrics?.byCausativeArea && monthlyMetrics.byCausativeArea.length > 0 ? (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center">
                    <Target className="h-6 w-6 mr-3" />
                    Reposiciones por Área Causante del Daño - {currentMonthName}
                  </CardTitle>
                  <Button
                    onClick={() => handleExport('causativeArea')}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Gráfico de barras */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-yellow-600" />
                      Reposiciones por Área Responsable
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={monthlyMetrics.byCausativeArea}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-600" />
                        <XAxis
                          dataKey="area"
                          tick={{ fontSize: 12, fill: 'currentColor' }}
                          className="text-gray-700 dark:text-white"
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: 'currentColor' }}
                          className="text-gray-700 dark:text-white"
                        />

                        <Bar dataKey="count" fill="url(#colorGradientYellow)" radius={[4, 4, 0, 0]} />
                        <defs>
                          <linearGradient id="colorGradientYellow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#D97706" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Gráfico de pastel */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Distribución Porcentual por Área Responsable</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={monthlyMetrics.byCausativeArea}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ area, percentage }) => `${area}: ${percentage}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {monthlyMetrics.byCausativeArea.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>

                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tarjetas de estadísticas */}
                  <div className="xl:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Estadísticas por Área Causante</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {monthlyMetrics.byCausativeArea.map((area: any, index: number) => (
                        <Card key={area.area} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 dark:border-slate-700">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{area.area}</p>
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{area.count} reposiciones</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Repos: {area.reposiciones || 0} | Reproc: {area.reprocesos || 0}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge
                                  style={{
                                    backgroundColor: COLORS[index % COLORS.length],
                                    fontSize: '16px',
                                    padding: '8px 12px'
                                  }}
                                  className="text-white font-bold"
                                >
                                  {area.percentage}%
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            ) : (
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/50 p-8 text-center text-slate-500">
                No hay datos de áreas responsables disponibles para este período.
              </Card>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-6 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center">
                  <FileText className="h-6 w-6 mr-3" />
                  Análisis por Número de Solicitud
                </CardTitle>
                <Button
                  onClick={() => handleExport('requests')}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {requestLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                </div>
              ) : requestError ? (
                <div className="text-center py-16">
                  <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <p className="text-red-600 text-lg font-medium">{requestError.message}</p>
                </div>
              ) : requestAnalysis ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Solicitudes con Reposiciones",
                        value: requestAnalysis.totalRequestsWithRepositions,
                        icon: FileText,
                        color: "blue"
                      },
                      {
                        title: "Promedio Repos./Solicitud",
                        value: requestAnalysis.averageRepositionsPerRequest,
                        icon: TrendingUp,
                        color: "green"
                      },
                      {
                        title: "Solicitud Más Problemática",
                        value: requestAnalysis.mostProblematicRequest,
                        icon: AlertTriangle,
                        color: "red"
                      }
                    ].map((stat, index) => (
                      <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 dark:border-slate-700">
                        <CardContent className="p-6">
                          <div className="text-center space-y-4">
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                              stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                              }`}>
                              <stat.icon className={`h-8 w-8 ${stat.color === 'blue' ? 'text-blue-600' :
                                stat.color === 'green' ? 'text-green-600' : 'text-red-600'
                                }`} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{stat.title}</p>
                              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Top 10 Solicitudes con Más Reposiciones</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-orange-200 dark:border-orange-700">
                            <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300">No. Solicitud</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300">Reposiciones</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300">Reprocesos</th>
                            <th className="text-left py-4 px-6 font-bold text-gray-700 dark:text-gray-300">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requestAnalysis.topRequests.map((request: any, index: number) => (
                            <tr key={request.noSolicitud} className="border-b border-orange-100 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors duration-200">
                              <td className="py-4 px-6 font-medium text-gray-800 dark:text-gray-200">{request.noSolicitud}</td>
                              <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{request.reposiciones}</td>
                              <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{request.reprocesos}</td>
                              <td className="py-4 px-6 font-bold text-gray-900 dark:text-gray-100">{request.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg">No hay datos disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
