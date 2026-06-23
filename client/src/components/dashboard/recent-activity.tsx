import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Settings, Eye, Activity } from 'lucide-react';
import { useState } from 'react';
import { RepositionDetail } from '@/components/repositions/RepositionDetail';
import { cn } from '@/lib/utils';

interface RecentReposition {
  id: number;
  folio: string;
  type: string;
  status: string;
  currentArea: string;
  createdAt: string;
  solicitanteNombre: string;
  modeloPrenda: string;
  urgencia: string;
}

const statusColors = {
  pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  aprobado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rechazado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  en_proceso: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completado: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  cancelado: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
};

const urgencyColors = {
  urgente: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  intermedio: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  poco_urgente: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
};

export function RecentActivity() {
  const [selectedReposition, setSelectedReposition] = useState<number | null>(null);

  const { data: activity } = useQuery({
    queryKey: ['/api/dashboard/recent-activity'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/recent-activity');
      if (!response.ok) throw new Error('Failed to fetch recent activity');
      return response.json();
    },
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Mexico_City'
    });
  };

  return (
    <>
      <Card className="w-full border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/5 dark:to-blue-950/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-purple-800 dark:text-purple-300">
            <Activity className="w-6 h-6 text-purple-600" />
            Reposiciones Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity?.repositions?.length > 0 ? (
              activity.repositions.map((reposition: RecentReposition) => (
                <div 
                  key={reposition.id} 
                  className={cn(
                    "flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm gap-4",
                    reposition.urgencia === 'urgente' ? 'border-l-4 border-l-red-500' :
                    reposition.urgencia === 'intermedio' ? 'border-l-4 border-l-amber-500' :
                    'border-l-4 border-l-emerald-500',
                    'border-gray-200 dark:border-slate-800'
                  )}
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-extrabold text-purple-600 dark:text-purple-400 text-lg tracking-tight">{reposition.folio}</p>
                      
                      <div className="flex flex-wrap gap-1.5 ml-2">
                        <Badge className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", statusColors[reposition.status as keyof typeof statusColors])}>
                          {reposition.status}
                        </Badge>
                        <Badge className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", urgencyColors[reposition.urgencia as keyof typeof urgencyColors])}>
                          {reposition.urgencia}
                        </Badge>
                        <Badge variant="outline" className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                          {reposition.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-500 dark:text-gray-400">Modelo:</span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-850 dark:text-slate-200 font-bold">
                        {reposition.modeloPrenda}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDate(reposition.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-850">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Área Actual:</span>
                      <span className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-semibold text-xs uppercase tracking-wider">
                        {reposition.currentArea}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:bg-blue-50 border-blue-200 w-full md:w-auto"
                      onClick={() => setSelectedReposition(reposition.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay reposiciones recientes</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedReposition && (
        <RepositionDetail
          repositionId={selectedReposition}
          onClose={() => setSelectedReposition(null)}
        />
      )}
    </>
  );
}