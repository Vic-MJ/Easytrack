import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileUpload } from '@/components/ui/file-upload';
import { X, Clock, User, Package, FileText, Upload, Download, Printer, Activity, Edit } from 'lucide-react';
import { RepositionPrintSummary } from './RepositionPrintSummary';
import { RepositionForm } from './RepositionForm';
import Swal from 'sweetalert2';
import { HistoryTimeline } from "@/components/shared/HistoryTimeline";
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';


interface RepositionDetail {
  id: number;
  folio: string;
  type: string;
  solicitanteNombre: string;
  solicitanteArea: string;
  fechaSolicitud: string;
  noSolicitud: string;
  noHoja?: string;
  fechaCorte?: string;
  causanteDano: string;
  descripcionSuceso: string;
  modeloPrenda: string;
  tela: string;
  color: string;
  tipoPieza: string;
  urgencia: string;
  observaciones?: string;
  currentArea: string;
  status: string;
  createdAt: string;
  approvedAt?: string;
  consumoTela?: number;
  tipoAccidente?: string;
  otroAccidente?: string;
  areaCausanteDano?: string;
  volverHacer?: string;
  materialesImplicados?: string;
  rejectionReason?: string;
}

interface RepositionPiece {
  id: number;
  repositionProductId?: number;
  talla: string;
  cantidad: number | string;
  folioOriginal?: string;
  unit?: 'piezas' | 'pares';
}

interface RepositionProduct {
  id: number;
  repositionId: number;
  modeloPrenda: string;
  tela: string;
  color: string;
  tipoPieza: string;
  consumoTela?: number;
}

interface RepositionHistory {
  id: number;
  action: string;
  description: string;
  fromArea?: string;
  toArea?: string;
  createdAt: string;
}

const statusColors = {
  pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  aprobado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rechazado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  en_proceso: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completado: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  cancelado: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

const urgencyColors = {
  urgente: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  intermedio: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  poco_urgente: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};

export function RepositionDetail({
  repositionId,
  onClose
}: {
  repositionId: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [showPrintSummary, setShowPrintSummary] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'general' | 'incident' | 'products' | 'documents'>('general');


  const { data: reposition, isLoading } = useQuery({
    queryKey: ['reposition', repositionId],
    queryFn: async () => {
      const response = await fetch(`/api/repositions/${repositionId}?t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch reposition');
      const data = await response.json();

      return data;
    },
    staleTime: 0, // Always consider data stale to force refetch
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // Refetch every 3 seconds
    refetchOnMount: 'always' // Always refetch when component mounts
  });

  const { data: pieces = [], isLoading: isPiecesLoading } = useQuery<RepositionPiece[]>({
    queryKey: ['reposition-pieces', repositionId],
    queryFn: async () => {
      const response = await fetch(`/api/repositions/${repositionId}/pieces?t=${Date.now()}`);
      if (!response.ok) return [];
      const data: RepositionPiece[] = await response.json();
      console.log('Pieces data completa:', data);
      console.log('Pieces con folios:', data.filter(p => p.folioOriginal));
      data.forEach((piece, index) => {
        console.log(`Piece ${index}:`, {
          id: piece.id,
          talla: piece.talla,
          cantidad: piece.cantidad,
          folioOriginal: piece.folioOriginal,
          folioOriginalType: typeof piece.folioOriginal
        });
      });
      return data;
    },
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // Refetch every 3 seconds
    refetchOnMount: 'always' // Always refetch when component mounts
  });

  const { data: history = [] } = useQuery({
    queryKey: ['reposition-history', repositionId],
    queryFn: async () => {
      const response = await fetch(`/api/repositions/${repositionId}/history`);
      if (!response.ok) return [];
      return response.json();
    }
  });



  const { data: productos = [] } = useQuery<RepositionProduct[]>({
    queryKey: ['reposition-products', repositionId],
    queryFn: async () => {
      const response = await fetch(`/api/repositions/${repositionId}/products?t=${Date.now()}`);
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // Refetch every 3 seconds
    refetchOnMount: 'always' // Always refetch when component mounts
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['reposition-documents', repositionId],
    queryFn: async () => {
      const response = await fetch(`/api/repositions/${repositionId}/documents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) return [];
      return response.json();
    }
  });

  const uploadDocumentsMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', file);
      });

      const response = await fetch(`/api/repositions/${repositionId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload documents');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reposition-documents', repositionId] });
      setSelectedFiles([]);
      setShowUpload(false);
      Swal.fire({
        title: '¡Éxito!',
        text: 'Documentos subidos correctamente',
        icon: 'success',
        confirmButtonColor: '#8B5CF6'
      });
    },
    onError: () => {
      Swal.fire({
        title: 'Error',
        text: 'Error al subir documentos',
        icon: 'error',
        confirmButtonColor: '#8B5CF6'
      });
    }
  });

  const handleUploadDocuments = () => {
    if (selectedFiles.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Selecciona al menos un archivo',
        icon: 'error',
        confirmButtonColor: '#8B5CF6'
      });
      return;
    }
    uploadDocumentsMutation.mutate(selectedFiles);
  };

  const handleDownloadFile = async (filename: string) => {
    try {
      const response = await fetch(`/api/files/${filename}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al descargar el archivo',
        icon: 'error',
        confirmButtonColor: '#8B5CF6'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8">
          <div className="text-center dark:text-white">Cargando detalles...</div>
        </div>
      </div>
    );
  }

  if (!reposition) return null;  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 uppercase tracking-wider">
                  {reposition.type}
                </span>
                <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  Folio: {reposition.folio}
                </p>
              </div>
              <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Detalles de Solicitud
              </h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1.5 mr-2">
                <Badge className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-sm", statusColors[reposition.status as keyof typeof statusColors])}>
                  {reposition.status}
                </Badge>
                <Badge className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-sm", urgencyColors[reposition.urgencia as keyof typeof urgencyColors])}>
                  {reposition.urgencia}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                {/* Botón de Editar para áreas de envíos y admin */}
                {(user?.area === 'envios' || user?.area === 'admin') && (
                  <Button
                    onClick={() => setShowEditForm(true)}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-900/40 dark:hover:bg-orange-950/20 font-bold rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1.5" />
                    Editar
                  </Button>
                )}

                <Button
                  onClick={() => setShowPrintSummary(true)}
                  className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-all duration-200"
                >
                  <Printer className="w-4 h-4 mr-1.5" />
                  Imprimir
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full w-9 h-9 p-0 flex items-center justify-center transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Selector */}
        <div className="px-6 bg-slate-50/30 dark:bg-slate-950/10 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex space-x-1 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-extrabold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer",
                activeTab === 'general'
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <FileText className="w-4 h-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab('incident')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-extrabold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer",
                activeTab === 'incident'
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Detalle Daño
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-extrabold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer",
                activeTab === 'products'
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <Package className="w-4 h-4" />
              Productos y Piezas
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-extrabold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer",
                activeTab === 'documents'
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              Documentos ({documents.length})
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/20 dark:bg-slate-900/10">
          
          {/* TAB 1: INFORMACIÓN GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-200 slide-in-from-bottom-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card: Solicitante */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm rounded-xl hover:border-purple-200 dark:hover:border-purple-900/40 transition-colors">
                  <CardHeader className="py-4 px-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
                    <CardTitle className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-500" />
                      Información del Solicitante
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nombre</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{reposition.solicitanteNombre}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Área</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">{reposition.solicitanteArea}</p>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha de Solicitud</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {new Date(reposition.fechaSolicitud).toLocaleDateString('es-ES', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Card: Referencias */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm rounded-xl hover:border-purple-200 dark:hover:border-purple-900/40 transition-colors">
                  <CardHeader className="py-4 px-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
                    <CardTitle className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      Referencias y Fechas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">No. Solicitud de Pedido</p>
                        <p className="font-mono font-bold text-purple-600 dark:text-purple-400 mt-0.5">{reposition.noSolicitud}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">No. de Hoja</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{reposition.noHoja || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha de Corte</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {reposition.fechaCorte ? new Date(reposition.fechaCorte).toLocaleDateString('es-ES', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card: Estado Actual y Tiempos */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm rounded-xl hover:border-purple-200 dark:hover:border-purple-900/40 transition-colors">
                <CardHeader className="py-4 px-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
                  <CardTitle className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    Estado del Trámite y Tiempos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 text-sm space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Área Actual</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">{reposition.currentArea}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha de Registro</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {new Date(reposition.createdAt).toLocaleString('es-ES', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha de Aprobación</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {reposition.approvedAt ? new Date(reposition.approvedAt).toLocaleString('es-ES', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : 'Aún sin aprobar'}
                      </p>
                    </div>
                  </div>

                  {reposition.status === 'rechazado' && reposition.rejectionReason && (
                    <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 animate-in fade-in duration-200">
                      <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider">Motivo del Rechazo</p>
                      <p className="text-red-650 dark:text-red-400 font-bold whitespace-pre-wrap bg-red-50/40 dark:bg-red-950/20 p-3 rounded-lg border border-red-100 dark:border-red-950 mt-1 leading-relaxed">
                        {reposition.rejectionReason}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card: Observaciones */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm rounded-xl hover:border-purple-200 dark:hover:border-purple-900/40 transition-colors">
                <CardHeader className="py-4 px-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
                  <CardTitle className="text-sm font-bold text-slate-850 dark:text-slate-200">
                    Observaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 text-sm">
                  <p className="text-slate-650 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800/40 whitespace-pre-wrap leading-relaxed">
                    {reposition.observaciones || 'Sin observaciones adicionales registradas.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 2: DETALLES DEL INCIDENTE */}
          {activeTab === 'incident' && (
            <div className="space-y-6 animate-in fade-in duration-200 slide-in-from-bottom-2">
              <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm rounded-xl hover:border-purple-200 dark:hover:border-purple-900/40 transition-colors">
                <CardHeader className="py-4 px-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
                  <CardTitle className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Origen del Incidente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-5 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Causante del Daño</p>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{reposition.causanteDano}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Área Responsable / Causante</p>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">{reposition.areaCausanteDano || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo de Incidente / Accidente</p>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{reposition.tipoAccidente || 'N/A'}</p>
                    {reposition.otroAccidente && (
                      <div className="mt-2 p-2.5 rounded bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850/50">
                        <p className="text-xs text-slate-550 dark:text-slate-400">
                          <strong>Especificación del Accidente:</strong> {reposition.otroAccidente}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm rounded-xl hover:border-purple-200 dark:hover:border-purple-900/40 transition-colors">
                <CardHeader className="py-4 px-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
                  <CardTitle className="text-sm font-bold text-slate-855 dark:text-slate-200">
                    Descripción del Suceso
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 text-sm">
                  <p className="text-slate-650 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800/40 whitespace-pre-wrap leading-relaxed font-semibold">
                    {reposition.descripcionSuceso}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: PRODUCTOS Y PIEZAS */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-200 slide-in-from-bottom-2">
              
              {/* VISTA PARA REPROCESOS */}
              {reposition.type === 'reproceso' && (
                <div className="space-y-6">
                  <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm rounded-xl hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-colors">
                    <CardHeader className="py-4 px-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
                      <CardTitle className="text-sm font-bold text-slate-850 dark:text-slate-200">
                        Detalles del Reproceso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">¿Qué se debe volver a hacer?</p>
                        <p className="text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950/30 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/40 whitespace-pre-wrap leading-relaxed font-semibold">
                          {reposition.volverHacer || 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Materiales Implicados</p>
                        <p className="text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950/30 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/40 whitespace-pre-wrap leading-relaxed font-semibold">
                          {reposition.materialesImplicados || 'No especificados'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm rounded-xl">
                    <CardContent className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modelo Prenda</p>
                          <p className="font-black text-xl text-purple-600 dark:text-purple-400 mt-1">{reposition.modeloPrenda || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Desglose de Tallas y Cantidades</p>
                          <div className="space-y-2">
                            {pieces.length > 0 ? (
                              pieces.map((p: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm px-3.5 py-2.5 bg-slate-50/80 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 rounded-lg shadow-sm">
                                  <span className="font-bold text-slate-700 dark:text-slate-300">Talla: {p.talla}</span>
                                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-extrabold px-2.5 py-0.5 rounded-full">{p.cantidad} {p.unit || 'piezas'}</Badge>
                                </div>
                              ))
                            ) : (
                              <p className="text-slate-400 italic text-sm">No hay piezas registradas</p>
                            )}

                            {pieces.length > 0 && (
                              <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-200 dark:border-slate-800/80 font-bold">
                                <span className="text-slate-500 dark:text-slate-400">Total Unidades:</span>
                                <span className="text-xl text-purple-600 dark:text-purple-400 font-extrabold font-mono">
                                  {pieces.reduce((acc: number, p: any) => acc + Number(p.cantidad), 0)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* VISTA PARA REPOSICIONES */}
              {reposition.type !== 'reproceso' && (
                <div className="space-y-6">
                  {/* List of Products */}
                  <div className="space-y-4">
                    {productos.length > 0 ? (
                      productos.map((producto: any, index: number) => (
                        <Card key={producto.id} className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:shadow-md transition-shadow relative overflow-hidden rounded-xl">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 to-indigo-500/50" />
                          <CardHeader className="py-3 px-5 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/10">
                            <CardTitle className="text-xs font-extrabold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                              Producto {index + 1}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-5">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modelo Prenda</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{producto.modeloPrenda}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tela</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{producto.tela}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Color</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{producto.color}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo de Pieza</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{producto.tipoPieza}</p>
                              </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800/60 mt-4 pt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tallas</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                  {(() => {
                                    const productPieces = pieces.filter((p: any) => p.repositionProductId === producto.id);
                                    if (productPieces.length === 0 && pieces.length > 0 && !pieces[0].repositionProductId) {
                                      const piecesPerProduct = Math.ceil(pieces.length / productos.length);
                                      const startIndex = index * piecesPerProduct;
                                      const endIndex = startIndex + piecesPerProduct;
                                      const legacyProductPieces = pieces.slice(startIndex, endIndex);
                                      const uniqueSizes = Array.from(new Set(legacyProductPieces.map((p: any) => p.talla))).filter(Boolean);
                                      return uniqueSizes.length > 0 ? uniqueSizes.join(', ') : 'N/A';
                                    }
                                    const uniqueSizes = Array.from(new Set(productPieces.map((p: any) => p.talla))).filter(Boolean);
                                    return uniqueSizes.length > 0 ? uniqueSizes.join(', ') : 'N/A';
                                  })()}
                                </p>
                              </div>
                              {producto.consumoTela ? (
                                <div>
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consumo Tela</p>
                                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{producto.consumoTela} metros</p>
                                </div>
                              ) : null}
                              {producto.consumoTela ? (
                                <div>
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Costo Estimado</p>
                                  <p className="font-bold text-green-600 dark:text-green-400 mt-0.5">${(producto.consumoTela * 60).toFixed(2)}</p>
                                </div>
                              ) : null}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      /* Fallback Retrocompatibilidad */
                      <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm rounded-xl">
                        <CardContent className="p-5">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modelo Prenda</p>
                              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{reposition.modeloPrenda}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tela</p>
                              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{reposition.tela}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Color</p>
                              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{reposition.color}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo de Pieza</p>
                              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{reposition.tipoPieza}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Talla</p>
                              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                {Array.from(new Set(pieces.map((p: any) => p.talla))).filter(Boolean).join(', ') || 'N/A'}
                              </p>
                            </div>
                            {reposition.consumoTela ? (
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consumo Tela</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{reposition.consumoTela} m</p>
                              </div>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Table of pieces */}
                  <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="py-4 px-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
                      <CardTitle className="text-sm font-bold text-slate-850 dark:text-slate-200 flex justify-between items-center">
                        <span>Desglose de Piezas</span>
                        <Badge variant="outline" className="border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 font-bold">
                          Total: {pieces.reduce((total, p) => total + (typeof p.cantidad === 'number' ? p.cantidad : parseInt(p.cantidad) || 0), 0)} piezas
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-950/20">
                          <TableRow>
                            <TableHead className="py-3 px-5 dark:text-gray-300 text-xs font-extrabold uppercase">Tipo de Pieza</TableHead>
                            <TableHead className="py-3 px-5 dark:text-gray-300 text-xs font-extrabold uppercase">Talla</TableHead>
                            <TableHead className="py-3 px-5 dark:text-gray-300 text-xs font-extrabold uppercase">Cantidad</TableHead>
                            <TableHead className="py-3 px-5 dark:text-gray-300 text-xs font-extrabold uppercase">Unidad</TableHead>
                            <TableHead className="py-3 px-5 dark:text-gray-300 text-xs font-extrabold uppercase text-right">Total Piezas</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            if (reposition.type !== 'reproceso' && productos && productos.length > 0) {
                              return productos.map((producto: any, prodIndex: number) => {
                                // Filter pieces belonging to this product
                                const productPieces = pieces.filter((p: any) => {
                                  if (p.repositionProductId) {
                                    return p.repositionProductId === producto.id;
                                  }
                                  // Fallback logic
                                  const piecesPerProduct = Math.ceil(pieces.length / productos.length);
                                  const startIndex = prodIndex * piecesPerProduct;
                                  const endIndex = startIndex + piecesPerProduct;
                                  const pieceIndex = pieces.indexOf(p);
                                  return pieceIndex >= startIndex && pieceIndex < endIndex;
                                });

                                if (productPieces.length === 0) return null;

                                const productTotal = productPieces.reduce((total, p) => {
                                  const cantidad = typeof p.cantidad === 'number' ? p.cantidad : parseInt(p.cantidad) || 0;
                                  return total + (p.unit === 'pares' ? cantidad * 2 : cantidad);
                                }, 0);

                                return (
                                  <Fragment key={producto.id || prodIndex}>
                                    {/* Product Section Header Row */}
                                    <TableRow className="bg-purple-50/40 dark:bg-purple-950/20 border-y border-slate-200 dark:border-slate-800">
                                      <TableCell colSpan={5} className="py-2 px-5 text-purple-700 dark:text-purple-400 font-extrabold text-[11px] uppercase tracking-wider">
                                        Producto {prodIndex + 1}: {producto.modeloPrenda} • {producto.tela} • {producto.color} ({producto.tipoPieza})
                                      </TableCell>
                                    </TableRow>
                                    {/* Product Pieces */}
                                    {productPieces.map((piece: RepositionPiece) => {
                                      const cantidad = typeof piece.cantidad === 'number' ? piece.cantidad : parseInt(piece.cantidad) || 0;
                                      return (
                                        <TableRow key={`piece-${piece.id}`} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/30 dark:hover:bg-slate-950/5">
                                          <TableCell className="py-2.5 px-5 font-semibold text-slate-755 dark:text-slate-200">{producto.tipoPieza}</TableCell>
                                          <TableCell className="py-2.5 px-5 font-bold text-slate-850 dark:text-slate-300">{piece.talla}</TableCell>
                                          <TableCell className="py-2.5 px-5">
                                            <Badge variant="secondary" className="font-semibold">{cantidad}</Badge>
                                          </TableCell>
                                          <TableCell className="py-2.5 px-5">
                                            <Badge variant="outline" className="text-xs uppercase">{piece.unit || 'piezas'}</Badge>
                                          </TableCell>
                                          <TableCell className="py-2.5 px-5 text-right font-bold text-slate-800 dark:text-slate-200">
                                            {piece.unit === 'pares' ? `${cantidad * 2} pz` : `${cantidad} pz`}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                    {/* Product Subtotal Row */}
                                    <TableRow className="bg-slate-100/20 dark:bg-slate-950/5 border-b border-slate-200 dark:border-slate-800">
                                      <TableCell colSpan={4} className="py-2 px-5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Subtotal Producto {prodIndex + 1}:
                                      </TableCell>
                                      <TableCell className="py-2 px-5 text-right font-extrabold text-sm text-purple-700 dark:text-purple-400">
                                        {productTotal} pz
                                      </TableCell>
                                    </TableRow>
                                  </Fragment>
                                );
                              });
                            } else {
                              // Fallback / legacy display
                              return pieces.map((piece: RepositionPiece) => {
                                const cantidad = typeof piece.cantidad === 'number' ? piece.cantidad : parseInt(piece.cantidad) || 0;
                                return (
                                  <TableRow key={`legacy-${piece.id}`} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/30 dark:hover:bg-slate-950/5">
                                    <TableCell className="py-3.5 px-5 font-semibold text-slate-755 dark:text-slate-200">{reposition.tipoPieza}</TableCell>
                                    <TableCell className="py-3.5 px-5 font-bold text-slate-850 dark:text-slate-300">{piece.talla}</TableCell>
                                    <TableCell className="py-3.5 px-5">
                                      <Badge variant="secondary" className="font-semibold">{cantidad}</Badge>
                                    </TableCell>
                                    <TableCell className="py-3.5 px-5">
                                      <Badge variant="outline" className="text-xs uppercase">{piece.unit || 'piezas'}</Badge>
                                    </TableCell>
                                    <TableCell className="py-3.5 px-5 text-right font-bold text-slate-800 dark:text-slate-200">
                                      {piece.unit === 'pares' ? `${cantidad * 2} pz` : `${cantidad} pz`}
                                    </TableCell>
                                  </TableRow>
                                );
                              });
                            }
                          })()}
                        </TableBody>
                      </Table>

                      <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-500 dark:text-slate-400">Total Real de Piezas:</span>
                        <span className="font-extrabold text-base text-purple-700 dark:text-purple-400">
                          {pieces.reduce((total, p) => {
                            const cantidad = typeof p.cantidad === 'number' ? p.cantidad : parseInt(p.cantidad) || 0;
                            return total + (p.unit === 'pares' ? cantidad * 2 : cantidad);
                          }, 0)} pz
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DOCUMENTOS */}
          {activeTab === 'documents' && (
            <div className="space-y-6 animate-in fade-in duration-200 slide-in-from-bottom-2">
              <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden hover:border-purple-200 dark:hover:border-purple-900/40 transition-colors">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/40 py-4 px-6 flex justify-between items-center flex-row">
                  <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    Documentos Adjuntos ({documents.length})
                  </CardTitle>
                  <Button
                    onClick={() => setShowUpload(true)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1.5 h-9"
                  >
                    <Upload className="w-4 h-4" />
                    Añadir Documentos
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {documents.length > 0 ? (
                    <Table>
                      <TableHeader className="bg-slate-50/50 dark:bg-slate-950/20">
                        <TableRow>
                          <TableHead className="py-3 px-5 dark:text-gray-300 text-xs font-extrabold uppercase">Nombre del Archivo</TableHead>
                          <TableHead className="py-3 px-5 dark:text-gray-300 text-xs font-extrabold uppercase">Tamaño</TableHead>
                          <TableHead className="py-3 px-5 dark:text-gray-300 text-xs font-extrabold uppercase">Subido por</TableHead>
                          <TableHead className="py-3 px-5 dark:text-gray-300 text-xs font-extrabold uppercase">Fecha</TableHead>
                          <TableHead className="py-3 px-5 dark:text-gray-300 text-xs font-extrabold uppercase text-right">Descargar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc: any) => (
                          <TableRow key={doc.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/30 dark:hover:bg-slate-950/5">
                            <TableCell className="py-3.5 px-5 font-semibold text-slate-700 dark:text-slate-200">{doc.originalName}</TableCell>
                            <TableCell className="py-3.5 px-5 dark:text-slate-350">{(doc.size / 1024).toFixed(1)} KB</TableCell>
                            <TableCell className="py-3.5 px-5 dark:text-slate-350">{doc.uploaderName}</TableCell>
                            <TableCell className="py-3.5 px-5 dark:text-slate-350">
                              {new Date(doc.createdAt).toLocaleDateString('es-ES')}
                            </TableCell>
                            <TableCell className="py-3.5 px-5 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadFile(doc.filename)}
                                className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border-slate-200 dark:border-slate-850 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-slate-600 dark:text-slate-400 hover:text-purple-600"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-10 h-10 mx-auto text-slate-350 dark:text-slate-600 mb-2" />
                      <p className="text-slate-400 dark:text-slate-500 text-sm">
                        No hay documentos de soporte adjuntos a esta solicitud.
                      </p>
                    </div>
                  )}

                  {/* Upload Modal */}
                  {showUpload && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800/80 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold mb-4 dark:text-white bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">Añadir Documentos</h3>
                        <FileUpload
                          onFileSelect={setSelectedFiles}
                          label="Documentos adicionales"
                          description="Adjunta documentos relacionados (formatos PDF, XML, imágenes hasta 10MB)"
                          maxFiles={5}
                          maxSize={10}
                        />
                        <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                          <Button
                            variant="outline"
                            className="h-10 rounded-lg text-slate-700 dark:text-slate-350"
                            onClick={() => {
                              setShowUpload(false);
                              setSelectedFiles([]);
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleUploadDocuments}
                            disabled={uploadDocumentsMutation.isPending}
                            className="h-10 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold px-5"
                          >
                            {uploadDocumentsMutation.isPending ? 'Subiendo...' : 'Subir'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/20 flex justify-end">
          <Button 
            onClick={onClose} 
            className="h-10 px-6 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors shadow-sm"
          >
            Cerrar Detalles
          </Button>
        </div>
      </div>

      {
        showPrintSummary && (
          <RepositionPrintSummary
            repositionId={repositionId}
            onClose={() => setShowPrintSummary(false)}
          />
        )
      }

      {
        showEditForm && (
          <RepositionForm
            repositionId={repositionId}
            onClose={() => {
              setShowEditForm(false);
              // Refrescar datos después de editar
              queryClient.invalidateQueries({ queryKey: ['reposition', repositionId] });
              queryClient.invalidateQueries({ queryKey: ['reposition-pieces', repositionId] });
              queryClient.invalidateQueries({ queryKey: ['reposition-products', repositionId] });
            }}
          />
        )
      }
    </div >
  );
}