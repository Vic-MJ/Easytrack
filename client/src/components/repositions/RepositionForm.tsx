import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import Swal from 'sweetalert2';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';



interface RepositionPiece {
  talla: string;
  cantidad: number | string;
  unit?: 'piezas' | 'pares';
  folioOriginal?: string;
}

interface ProductInfo {
  modeloPrenda: string;
  tela: string;
  color: string;
  tipoPieza: string;
  consumoTela?: number; // metros de tela
  pieces: RepositionPiece[];
}

interface RepositionFormData {
  type: string;
  solicitanteNombre: string;
  solicitanteArea: string;
  noSolicitud: string;
  noHoja?: string;
  fechaCorte?: string;
  causanteDano: string;
  descripcionSuceso: string;
  urgencia: string;
  observaciones?: string;
  currentArea: string;
  tipoAccidente?: string;
  otroAccidente?: string;
  volverHacer?: string;
  materialesImplicados?: string;
  areaCausanteDano?: string;
  productos: ProductInfo[];
}

const areas = [
  'patronaje', 'corte', 'bordado', 'ensamble', 'plancha', 'calidad', 'operaciones', 'diseño', 'almacen', 'maquilas'
];

const urgencyOptions = [
  { value: 'urgente', label: 'Urgente' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'poco_urgente', label: 'Poco Urgente' }
];

const commonAccidents = [
  'Accidente por operario',
  'Bordado mal posicionado',
  'Costuras en mal estado',
  'Daño por maquilero',
  'Daño por máquina',
  'Defecto de tela',
  'Defecto en el ensamble',
  'Error de diseño',
  'Error de información',
  'Error de plancha',
  'Error en la fabricación',
  'Falla en el proceso de corte',
  'Problema de calidad',
  'Tela sucia o manchada',
  'Otro'
];

export function RepositionForm({ onClose, repositionId }: { onClose: () => void; repositionId?: number }) {
  const queryClient = useQueryClient();
  const [productos, setProductos] = useState<ProductInfo[]>([{
    modeloPrenda: '',
    tela: '',
    color: '',
    tipoPieza: '',
    consumoTela: 0,
    pieces: [{ talla: '', cantidad: 1, folioOriginal: '', unit: 'piezas' as 'piezas' | 'pares' }]
  }]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Query to load existingreposición data if editing
  const { data: existingReposition } = useQuery({
    queryKey: ['reposition', repositionId, 'edit'],
    queryFn: async () => {
      if (!repositionId) return null;
      const response = await fetch(`/api/repositions/${repositionId}?t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch reposition');
      return response.json();
    },
    enabled: !!repositionId,
    staleTime: 0, // Always consider data stale
    refetchOnMount: 'always' // Always refetch when component mounts
  });

  const { data: existingPieces = [] } = useQuery({
    queryKey: ['reposition-pieces', repositionId, 'edit'],
    queryFn: async () => {
      if (!repositionId) return [];
      const response = await fetch(`/api/repositions/${repositionId}/pieces?t=${Date.now()}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!repositionId,
    staleTime: 0, // Always consider data stale
    refetchOnMount: 'always' // Always refetch when component mounts
  });

  const { data: existingProducts = [] } = useQuery({
    queryKey: ['reposition-products', repositionId, 'edit'],
    queryFn: async () => {
      if (!repositionId) return [];
      const response = await fetch(`/api/repositions/${repositionId}/products?t=${Date.now()}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!repositionId,
    staleTime: 0, // Always consider data stale
    refetchOnMount: 'always' // Always refetch when component mounts
  });

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = useForm<RepositionFormData>({
    defaultValues: {
      type: 'reposición',
      urgencia: 'intermedio',
      solicitanteNombre: '',
      solicitanteArea: '',
      noSolicitud: 'JN-SOL-',
      causanteDano: '',
      descripcionSuceso: '',
      currentArea: '',
      areaCausanteDano: '',
      tipoAccidente: '',
      productos: [{ modeloPrenda: '', tela: '', color: '', tipoPieza: '', consumoTela: 0, pieces: [{ talla: '', cantidad: 1, folioOriginal: '', unit: 'piezas' }] }]
    }
  });

  // Populate form with existing data when editing
  useEffect(() => {
    if (existingReposition) {
      setValue('type', existingReposition.type);
      setValue('solicitanteNombre', existingReposition.solicitanteNombre);
      setValue('noSolicitud', existingReposition.noSolicitud);
      setValue('noHoja', existingReposition.noHoja || '');
      setValue('fechaCorte', existingReposition.fechaCorte ? existingReposition.fechaCorte.split('T')[0] : '');
      setValue('causanteDano', existingReposition.causanteDano);
      setValue('tipoAccidente', existingReposition.tipoAccidente || '');
      setValue('otroAccidente', existingReposition.otroAccidente || '');
      setValue('areaCausanteDano', existingReposition.areaCausanteDano || '');
      setValue('solicitanteArea', existingReposition.solicitanteArea);
      setValue('currentArea', existingReposition.currentArea);
      setValue('descripcionSuceso', existingReposition.descripcionSuceso);
      setValue('urgencia', existingReposition.urgencia);
      setValue('observaciones', existingReposition.observaciones || '');
      setValue('volverHacer', existingReposition.volverHacer || '');
      setValue('materialesImplicados', existingReposition.materialesImplicados || '');

      if (existingReposition.type === 'reposición') {
        // Si hay productos adicionales, usarlos; si no, usar los datos principales
        if (existingProducts && existingProducts.length > 0) {
          const loadedProductos = existingProducts.map((product: any, index: number) => ({
            modeloPrenda: product.modeloPrenda || '',
            tela: product.tela || '',
            color: product.color || '',
            tipoPieza: product.tipoPieza || '',
            consumoTela: product.consumoTela || 0,
            pieces: existingPieces
              .filter((piece: any) => {
                // Distribuir las piezas entre los productos
                const piecesPerProduct = Math.ceil(existingPieces.length / existingProducts.length);
                const startIndex = index * piecesPerProduct;
                const endIndex = startIndex + piecesPerProduct;
                const pieceIndex = existingPieces.indexOf(piece);
                return pieceIndex >= startIndex && pieceIndex < endIndex;
              })
              .map((piece: any) => ({
                talla: piece.talla,
                cantidad: piece.cantidad,
                folioOriginal: piece.folioOriginal || '',
                unit: piece.unit || 'piezas'
              }))
          }));
          setProductos(loadedProductos);
        } else {
          // Fallback a los datos principales si no hay productos adicionales
          const newProductos = [{
            modeloPrenda: existingReposition.modeloPrenda || '',
            tela: existingReposition.tela || '',
            color: existingReposition.color || '',
            tipoPieza: existingReposition.tipoPieza || '',
            consumoTela: existingReposition.consumoTela || 0,
            pieces: existingPieces.map((piece: any) => ({
              talla: piece.talla,
              cantidad: piece.cantidad,
              folioOriginal: piece.folioOriginal || '',
              unit: piece.unit || 'piezas'
            }))
          }];
          setProductos(newProductos);
        }
      }
    }
  }, [existingReposition, existingPieces, existingProducts, setValue]);



  const createRepositionMutation = useMutation({
    mutationFn: async (data: RepositionFormData) => {
      const formDataToSend = new FormData();

      // Collect all pieces from all products
      const allPieces = productos.flatMap(producto => producto.pieces);

      // Agregar datos del formulario con las piezas incluidas
      formDataToSend.append('repositionData', JSON.stringify({
        ...data,
        pieces: allPieces,
        productos,
      }));

      // Agregar archivos
      selectedFiles.forEach((file) => {
        formDataToSend.append('documents', file);
      });

      const url = repositionId ? `/api/repositions/${repositionId}` : '/api/repositions';
      const method = repositionId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${repositionId ? 'update' : 'create'} reposition`);
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all repositions queries
      queryClient.invalidateQueries({ queryKey: ['repositions'] });

      if (repositionId) {
        // Remove all cached data for this reposition to force fresh fetch
        queryClient.removeQueries({ queryKey: ['reposition'] });
        queryClient.removeQueries({ queryKey: ['reposition-pieces'] });
        queryClient.removeQueries({ queryKey: ['reposition-products'] });
        queryClient.removeQueries({ queryKey: ['reposition-documents'] });
        queryClient.removeQueries({ queryKey: ['reposition-history'] });

        // Invalidate all related queries for this reposition with specific patterns
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && (
              key.includes('reposition') ||
              key.includes('reposition-pieces') ||
              key.includes('reposition-products') ||
              key.includes('reposition-documents') ||
              key.includes('reposition-history')
            );
          }
        });

        // Force immediate refetch for critical queries after a short delay
        setTimeout(() => {
          queryClient.refetchQueries({
            predicate: (query) => {
              const key = query.queryKey;
              return Array.isArray(key) && key.includes(repositionId);
            }
          });
        }, 200);
      }

      Swal.fire({
        title: '¡Éxito!',
        text: repositionId ? 'Solicitud editada y reenviada para aprobación' : 'Solicitud de reposición creada correctamente',
        icon: 'success',
        confirmButtonColor: '#8B5CF6'
      });
      onClose();
    },
    onError: (error) => {
      Swal.fire({
        title: 'Error',
        text: error.message || (repositionId ? 'Error al editar la solicitud' : 'Error al crear la solicitud de reposición'),
        icon: 'error',
        confirmButtonColor: '#8B5CF6'
      });
    }
  });



  const addProducto = () => {
    // Si ya existe al menos un producto, usar sus datos para el nuevo producto
    const baseProduct: ProductInfo = productos.length > 0 ? {
      modeloPrenda: productos[0].modeloPrenda,
      tela: productos[0].tela,
      color: productos[0].color,
      tipoPieza: '',
      consumoTela: 0,
      pieces: [{ talla: '', cantidad: 1, folioOriginal: '', unit: 'piezas' as 'piezas' | 'pares' }]
    } : {
      modeloPrenda: '',
      tela: '',
      color: '',
      tipoPieza: '',
      consumoTela: 0,
      pieces: [{ talla: '', cantidad: 1, folioOriginal: '', unit: 'piezas' as 'piezas' | 'pares' }]
    };

    setProductos([...productos, baseProduct]);
  };

  const removeProducto = (index: number) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  const updateProducto = (index: number, field: keyof ProductInfo, value: string | number) => {
    const newProductos = [...productos];
    if (field === 'pieces') return; // Handle pieces separately
    newProductos[index] = { ...newProductos[index], [field]: value };
    setProductos(newProductos);
  };

  const addProductPiece = (productIndex: number) => {
    const newProductos = [...productos];
    newProductos[productIndex].pieces.push({ talla: '', cantidad: 1, folioOriginal: '', unit: 'piezas' });
    setProductos(newProductos);
  };

  const removeProductPiece = (productIndex: number, pieceIndex: number) => {
    const newProductos = [...productos];
    newProductos[productIndex].pieces = newProductos[productIndex].pieces.filter((_, i) => i !== pieceIndex);
    setProductos(newProductos);
  };

  const updateProductPiece = (productIndex: number, pieceIndex: number, field: keyof RepositionPiece, value: string | number) => {
    const newProductos = [...productos];
    newProductos[productIndex].pieces[pieceIndex] = {
      ...newProductos[productIndex].pieces[pieceIndex],
      [field]: value
    };
    setProductos(newProductos);
  };

  const calculateResourceCost = () => {
    let totalCost = 0;

    // Costo de tela principal (60 pesos por metro)
    productos.forEach(producto => {
      if (producto.consumoTela) {
        totalCost += producto.consumoTela * 60;
      }
    });

    return totalCost;
  };

  const onSubmit = async (data: RepositionFormData) => {
    console.log('Form submitted with data:', data);

    // Validación básica de campos requeridos
    const requiredFields = [
      { field: 'solicitanteNombre', message: 'Nombre del solicitante es requerido' },
      { field: 'noSolicitud', message: 'Número de solicitud es requerido' },
      { field: 'causanteDano', message: 'Causante del daño es requerido' },
      { field: 'descripcionSuceso', message: 'Descripción del suceso es requerida' },
      { field: 'tipoAccidente', message: 'Tipo de accidente es requerido' },
      { field: 'areaCausanteDano', message: 'Área causante del daño es requerida' },
      { field: 'currentArea', message: 'Área actual es requerida' }
    ];

    for (const { field, message } of requiredFields) {
      if (!data[field as keyof RepositionFormData] || String(data[field as keyof RepositionFormData]).trim() === '') {
        Swal.fire({
          title: 'Error',
          text: message,
          icon: 'error',
          confirmButtonColor: '#8B5CF6'
        });
        return;
      }
    }

    // Validación específica para reposiciones
    if (data.type === 'reposición') {
      // Validate products and their pieces
      for (let i = 0; i < productos.length; i++) {
        const producto = productos[i];
        if (!producto.modeloPrenda || !producto.tela || !producto.color || !producto.tipoPieza) {
          Swal.fire({
            title: 'Error',
            text: `Todos los campos del producto ${i + 1} son requeridos`,
            icon: 'error',
            confirmButtonColor: '#8B5CF6'
          });
          return;
        }

        if (producto.pieces.some(p => !p.talla || Number(p.cantidad) < 1)) {
          Swal.fire({
            title: 'Error',
            text: `Todas las piezas del producto ${i + 1} deben tener talla y cantidad válida`,
            icon: 'error',
            confirmButtonColor: '#8B5CF6'
          });
          return;
        }
      }

      // Validar fecha de corte para cualquier área
      if (data.fechaCorte) {
        const fechaCorte = new Date(data.fechaCorte);
        const hoy = new Date();

        // Primer día del mes anterior
        const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);

        console.log('Validando fecha de corte:', {
          fechaCorte: data.fechaCorte,
          fechaCorteDate: fechaCorte.toDateString(),
          inicioMesAnterior: inicioMesAnterior.toDateString(),
          fechaCorteEsAnterior: fechaCorte < inicioMesAnterior
        });

        // Si la fecha de corte es anterior al inicio del mes pasado
        if (fechaCorte < inicioMesAnterior) {
          console.log('Fecha fuera de rango, mostrando SweetAlert...');

          const result = await Swal.fire({
            title: 'Fecha de Corte Fuera de Rango',
            html: `
                <div style="text-align: left; margin: 20px 0;">
                  <p><strong>LA FECHA DE CORTE SOBREPASA LOS DÍAS EN QUE EL ÁREA DE CORTE ALMACENA LOS TRAZOS, FAVOR DE PASAR LA REPOSICIÓN AL ÁREA DE PATRONAJE PRIMERO</strong></p>
                  <br>
                  <p><strong>PONTE EN CONTACTO CON EL SUP DE CORTE PARA SABER SI TIENE O NO EL TRAZO A SU DISPOSICIÓN</strong></p>
                </div>
              `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Continuar de todos modos',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#8B5CF6',
            cancelButtonColor: '#6b7280',
            width: '600px',
            allowOutsideClick: false,
            allowEscapeKey: false
          });

          console.log('Resultado del SweetAlert:', result);

          if (!result.isConfirmed) {
            console.log('Usuario canceló, deteniendo proceso');
            return;
          }

          console.log('Usuario confirmó continuar');
        }
      }
    }

    // Validación específica para reprocesos
    if (data.type === 'reproceso') {
      if (!data.volverHacer || !data.materialesImplicados) {
        Swal.fire({
          title: 'Error',
          text: 'Todos los campos del reproceso son requeridos',
          icon: 'error',
          confirmButtonColor: '#8B5CF6'
        });
        return;
      }

      // Validar campos de producto para reproceso (modelo, talla, cantidad)
      const producto = productos[0];
      if (!producto.modeloPrenda) {
        Swal.fire({
          title: 'Error',
          text: 'El Modelo es requerido para el reproceso',
          icon: 'error',
          confirmButtonColor: '#8B5CF6'
        });
        return;
      }

      // Validar todas las piezas (ahora puede haber múltiples)
      for (let i = 0; i < producto.pieces.length; i++) {
        const pieza = producto.pieces[i];
        if (!pieza.talla || !pieza.cantidad || Number(pieza.cantidad) < 1) {
          Swal.fire({
            title: 'Error',
            text: `La pieza #${i + 1} debe tener Talla y Cantidad válida`,
            icon: 'error',
            confirmButtonColor: '#8B5CF6'
          });
          return;
        }
      }
    }

    let formDataToSend: any = { ...data };

    // fechaSolicitud se maneja automáticamente por el schema con defaultNow()
    // No necesitamos convertir manualmente

    // fechaCorte debe mantenerse como string según el schema de la base de datos
    // No necesita conversión a Date object

    // Solo mapear datos de productos para reposiciones
    if (data.type === 'reposición' && productos.length > 0) {
      const firstProduct = productos[0];
      formDataToSend = {
        ...formDataToSend,
        modeloPrenda: firstProduct.modeloPrenda,
        tela: firstProduct.tela,
        color: firstProduct.color,
        tipoPieza: firstProduct.tipoPieza,
        consumoTela: firstProduct.consumoTela || 0
      };
    } else if (data.type === 'reproceso') {
      // Para reprocesos, enviar los datos del producto (modelo, talla, cantidad)
      const firstProduct = productos[0];
      formDataToSend = {
        ...formDataToSend,
        modeloPrenda: firstProduct.modeloPrenda,
        tela: 'N/A', // No requerido en formulario pero sí en BD
        color: 'N/A', // No requerido en formulario pero sí en BD
        tipoPieza: 'N/A', // No requerido en formulario pero sí en BD
        consumoTela: 0
      };
    }

    const result = await Swal.fire({
      title: '¿Confirmar Solicitud?',
      text: "¿Está seguro de querer crear esta solicitud?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8B5CF6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      createRepositionMutation.mutate(formDataToSend);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {repositionId ? 'Editar Solicitud' : 'Nueva Solicitud'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {repositionId ? 'Modifique los detalles de la solicitud y envíela de nuevo' : 'Complete la información para generar una nueva reposición o reproceso'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              onClick={onClose} 
              className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full w-10 h-10 p-0 flex items-center justify-center transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-2">
            {/* Tipo de Solicitud */}
            <RadioGroup
              value={watch('type')}
              onValueChange={(value: 'reposición' | 'reproceso') => setValue('type', value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Label
                htmlFor="reposición"
                className={cn(
                  "cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 flex items-start space-x-4 shadow-sm",
                  watch('type') === 'reposición'
                    ? "border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 shadow-purple-100 dark:shadow-none"
                    : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <RadioGroupItem value="reposición" id="reposición" className="sr-only" />
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  watch('type') === 'reposición'
                    ? "bg-purple-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                )}>
                  <Plus className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className={cn("font-bold text-base", watch('type') === 'reposición' ? "text-purple-900 dark:text-purple-300" : "text-slate-800 dark:text-slate-200")}>
                    Reposición de Piezas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-normal">
                    Solicita rehacer piezas específicas dañadas o faltantes en el flujo de producción.
                  </p>
                </div>
              </Label>

              <Label
                htmlFor="reproceso"
                className={cn(
                  "cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 flex items-start space-x-4 shadow-sm",
                  watch('type') === 'reproceso'
                    ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-indigo-100 dark:shadow-none"
                    : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <RadioGroupItem value="reproceso" id="reproceso" className="sr-only" />
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  watch('type') === 'reproceso'
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </div>
                <div className="space-y-1">
                  <h3 className={cn("font-bold text-base", watch('type') === 'reproceso' ? "text-indigo-900 dark:text-indigo-300" : "text-slate-800 dark:text-slate-200")}>
                    Reproceso de Operación
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-normal">
                    Solicita repetir un proceso completo o parte de una operación debido a fallas de calidad.
                  </p>
                </div>
              </Label>
            </RadioGroup>

            {/* Sección 1: Información General y Referencias */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden hover:border-purple-200 dark:hover:border-purple-900/40 transition-colors">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/40 py-4 px-6">
                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Información General y Referencias
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="solicitanteNombre" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre del Solicitante *</Label>
                    <Input
                      id="solicitanteNombre"
                      {...register('solicitanteNombre', { required: 'Campo requerido' })}
                      className={`h-11 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 focus-visible:ring-purple-500 rounded-lg transition-all duration-200 ${errors.solicitanteNombre ? 'border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500' : ''}`}
                      uppercase={true}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha de Solicitud</Label>
                    <Input 
                      value={new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} 
                      disabled 
                      className="h-11 border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 rounded-lg cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/60 my-4" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="noSolicitud" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Número de Solicitud *</Label>
                    <Input
                      id="noSolicitud"
                      {...register('noSolicitud', { required: 'Campo requerido' })}
                      className={`h-11 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 focus-visible:ring-purple-500 rounded-lg transition-all duration-200 ${errors.noSolicitud ? 'border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500' : ''}`}
                      uppercase={true}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="noHoja" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Número de Hoja</Label>
                    <Input
                      id="noHoja"
                      {...register('noHoja')}
                      uppercase={true}
                      className="h-11 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 focus-visible:ring-purple-500 rounded-lg transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fechaCorte" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha de Corte</Label>
                    <Input
                      id="fechaCorte"
                      type="date"
                      {...register('fechaCorte')}
                      className="h-11 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 focus-visible:ring-purple-500 rounded-lg transition-all duration-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sección 2: Detalles del Incidente */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden hover:border-purple-200 dark:hover:border-purple-900/40 transition-colors">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/40 py-4 px-6">
                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Detalles del Incidente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="causanteDano" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Causante del Daño *</Label>
                    <Input
                      id="causanteDano"
                      {...register('causanteDano', { required: 'Campo requerido' })}
                      className={`h-11 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 focus-visible:ring-purple-500 rounded-lg transition-all duration-200 ${errors.causanteDano ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      uppercase={true}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="tipoAccidente" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo de Accidente *</Label>
                    <Select
                      value={watch('tipoAccidente') || ''}
                      onValueChange={(value) => setValue('tipoAccidente', value)}
                    >
                      <SelectTrigger className="h-11 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 rounded-lg">
                        <SelectValue placeholder="Selecciona el tipo de accidente" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonAccidents.map((accident) => (
                          <SelectItem key={accident} value={accident}>
                            {accident}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {watch('tipoAccidente') === 'Otro' && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label htmlFor="otroAccidente" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Especificar tipo de accidente *</Label>
                    <Input
                      id="otroAccidente"
                      {...register('otroAccidente', {
                        required: watch('tipoAccidente') === 'Otro' ? 'Campo requerido' : false
                      })}
                      className={`h-11 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 focus-visible:ring-purple-500 rounded-lg transition-all duration-200 ${errors.otroAccidente ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      placeholder="Describe el tipo de accidente"
                      uppercase={true}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="areaCausanteDano" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Área Causante *</Label>
                    <Select
                      value={watch('areaCausanteDano') || ''}
                      onValueChange={(value) => setValue('areaCausanteDano', value)}
                    >
                      <SelectTrigger className="h-11 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 rounded-lg">
                        <SelectValue placeholder="Selecciona un área" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area.charAt(0).toUpperCase() + area.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="currentArea" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Área de Destino / Actual *</Label>
                    <Select
                      value={watch('currentArea') || ''}
                      onValueChange={(value) => setValue('currentArea', value)}
                    >
                      <SelectTrigger className="h-11 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 rounded-lg">
                        <SelectValue placeholder="Selecciona un área" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area.charAt(0).toUpperCase() + area.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="descripcionSuceso" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descripción del Suceso *</Label>
                  <Textarea
                    id="descripcionSuceso"
                    {...register('descripcionSuceso', { required: 'Campo requerido' })}
                    className={`border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 focus-visible:ring-purple-500 rounded-lg transition-all duration-200 ${errors.descripcionSuceso ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    rows={3}
                    placeholder="Describa brevemente cómo ocurrió el daño o pérdida..."
                    uppercase={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información del Producto - Solo para reposiciones */}
            {
              watch('type') === 'reposición' && (
                <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden hover:border-purple-200 dark:hover:border-purple-900/40 transition-colors">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/40 py-4 px-6 flex justify-between items-center flex-row">
                    <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                      Información del Producto
                    </CardTitle>
                    <Button 
                      type="button" 
                      onClick={addProducto} 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Producto
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {productos.map((producto, productIndex) => (
                        <div 
                          key={productIndex} 
                          className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/30 dark:bg-slate-950/10 hover:shadow-md transition-shadow relative overflow-hidden"
                        >
                          {/* Accent line on top of each product container */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 to-indigo-500/50" />

                          <div className="flex justify-between items-center mb-4 pt-1">
                            <h4 className="font-extrabold text-sm text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                              Producto {productIndex + 1}
                            </h4>
                            {productos.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProducto(productIndex)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg h-8 px-2"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Eliminar
                              </Button>
                            )}
                          </div>

                          {/* Información básica del producto */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modelo de la Prenda *</Label>
                              <Input
                                value={producto.modeloPrenda}
                                onChange={(e) => updateProducto(productIndex, 'modeloPrenda', e.target.value)}
                                placeholder="ej. JN-102"
                                uppercase={true}
                                className="h-10 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tela *</Label>
                              <Input
                                value={producto.tela}
                                onChange={(e) => updateProducto(productIndex, 'tela', e.target.value)}
                                placeholder="ej. Mezclilla"
                                uppercase={true}
                                className="h-10 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Color *</Label>
                              <Input
                                value={producto.color}
                                onChange={(e) => updateProducto(productIndex, 'color', e.target.value)}
                                placeholder="ej. Indigo"
                                uppercase={true}
                                className="h-10 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo de Pieza *</Label>
                              <Input
                                value={producto.tipoPieza}
                                onChange={(e) => updateProducto(productIndex, 'tipoPieza', e.target.value)}
                                placeholder="ej. Manga Izq"
                                uppercase={true}
                                className="h-10 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 rounded-lg"
                              />
                            </div>
                          </div>



                          {/* Piezas del producto */}
                          <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4">
                            <div className="flex justify-between items-center mb-3">
                              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Piezas Solicitadas en este Producto</Label>
                              <Button
                                type="button"
                                onClick={() => addProductPiece(productIndex)}
                                size="sm"
                                variant="outline"
                                className="border-purple-200 dark:border-purple-900/60 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-700 dark:text-purple-400 h-8 px-2.5 text-xs font-bold rounded-lg"
                              >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Agregar Pieza
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {producto.pieces.map((piece, pieceIndex) => (
                                <div key={pieceIndex} className="flex flex-col md:flex-row gap-3 items-start md:items-end bg-white/40 dark:bg-slate-950/10 p-3 rounded-lg border border-slate-100 dark:border-slate-900">
                                  <div className="w-full md:w-32 space-y-1">
                                    <Label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Talla</Label>
                                    <Input
                                      value={piece.talla}
                                      onChange={(e) => updateProductPiece(productIndex, pieceIndex, 'talla', e.target.value)}
                                      placeholder="ej. M"
                                      uppercase={true}
                                      className="h-9 border-slate-300 dark:border-slate-700 rounded-md"
                                    />
                                  </div>
                                  <div className="w-full md:flex-1 space-y-1">
                                    <Label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Cantidad</Label>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={piece.cantidad || ""}
                                        onChange={(e) => {
                                          const raw = e.target.value;
                                          const onlyNums = raw.replace(/\D/g, "");
                                          updateProductPiece(productIndex, pieceIndex, "cantidad", onlyNums);
                                        }}
                                        onBlur={(e) => {
                                          const val = e.target.value;
                                          if (val === "" || val === "0") {
                                            updateProductPiece(productIndex, pieceIndex, "cantidad", "1");
                                          }
                                        }}
                                        placeholder="1"
                                        className="h-9 text-center w-20 border-slate-300 dark:border-slate-700 rounded-md"
                                      />
                                      <div className="w-24">
                                        <Select
                                          value={piece.unit || 'piezas'}
                                          onValueChange={(val: 'piezas' | 'pares') => updateProductPiece(productIndex, pieceIndex, "unit", val)}
                                        >
                                          <SelectTrigger className="h-9 border-slate-300 dark:border-slate-700 rounded-md">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="piezas">Piezas</SelectItem>
                                            <SelectItem value="pares">Pares</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="w-full md:flex-1 space-y-1">
                                    <Label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">No° Folio Original (Opcional)</Label>
                                    <Input
                                      value={piece.folioOriginal || ''}
                                      onChange={(e) => updateProductPiece(productIndex, pieceIndex, 'folioOriginal', e.target.value)}
                                      placeholder="Sin folio"
                                      uppercase={true}
                                      className="h-9 border-slate-300 dark:border-slate-700 rounded-md"
                                    />
                                  </div>
                                  {producto.pieces.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeProductPiece(productIndex, pieceIndex)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md h-9 w-9 p-0 inline-flex items-center justify-center shrink-0 border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            }

            {/* Información del Reproceso - Solo para reprocesos */}
            {
              watch('type') === 'reproceso' && (
                <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-colors">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/40 py-4 px-6">
                    <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                      Información del Reproceso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-1">
                      <Label htmlFor="volverHacer" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">¿Qué se debe volver a hacer? *</Label>
                      <Textarea
                        id="volverHacer"
                        {...register('volverHacer', {
                          required: watch('type') === 'reproceso' ? 'Campo requerido' : false
                        })}
                        className={`border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 rounded-lg focus-visible:ring-indigo-500 ${errors.volverHacer ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        rows={3}
                        placeholder="Describe detalladamente qué procesos o costuras deben repetirse..."
                        uppercase={true}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="materialesImplicados" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Materiales Implicados *</Label>
                      <Textarea
                        id="materialesImplicados"
                        {...register('materialesImplicados', {
                          required: watch('type') === 'reproceso' ? 'Campo requerido' : false
                        })}
                        className={`border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 rounded-lg focus-visible:ring-indigo-500 ${errors.materialesImplicados ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        rows={3}
                        placeholder="Mencione la tela, hilos, botones u otros insumos involucrados..."
                        uppercase={true}
                      />
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800/80 pt-5 mt-4">
                      <div className="mb-4 max-w-sm space-y-1">
                        <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modelo del Producto *</Label>
                        <Input
                          value={productos[0].modeloPrenda}
                          onChange={(e) => updateProducto(0, 'modeloPrenda', e.target.value)}
                          placeholder="ej. JN-102"
                          uppercase={true}
                          className={`h-11 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 rounded-lg ${watch('type') === 'reproceso' && !productos[0].modeloPrenda ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-3">
                          <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tallas y Cantidades a Reprocesar</Label>
                          <Button
                            type="button"
                            onClick={() => addProductPiece(0)}
                            size="sm"
                            variant="outline"
                            className="border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 h-8 px-2.5 text-xs font-bold rounded-lg"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Agregar Talla
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {productos[0].pieces.map((piece, pieceIndex) => (
                            <div 
                              key={pieceIndex} 
                              className="flex flex-col md:flex-row gap-4 items-start md:items-end border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/20 dark:bg-slate-950/10 rounded-xl relative"
                            >
                              <div className="w-full md:w-44 space-y-1">
                                <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Talla *</Label>
                                <Input
                                  value={piece.talla || ''}
                                  onChange={(e) => updateProductPiece(0, pieceIndex, 'talla', e.target.value)}
                                  placeholder="ej. G / 32"
                                  uppercase={true}
                                  className={`h-10 border-slate-300 dark:border-slate-700 rounded-lg ${watch('type') === 'reproceso' && !piece.talla ? 'border-red-500' : ''}`}
                                />
                              </div>
                              <div className="w-full md:flex-1 space-y-1">
                                <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cantidad *</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={piece.cantidad || ''}
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const onlyNums = raw.replace(/\D/g, "");
                                      updateProductPiece(0, pieceIndex, "cantidad", onlyNums);
                                    }}
                                    onBlur={(e) => {
                                      const val = e.target.value;
                                      if (val === "" || val === "0") {
                                        updateProductPiece(0, pieceIndex, "cantidad", "1");
                                      }
                                    }}
                                    placeholder="1"
                                    className={`h-10 text-center w-24 border-slate-300 dark:border-slate-700 rounded-lg ${watch('type') === 'reproceso' && (!piece.cantidad || Number(piece.cantidad) < 1) ? 'border-red-500' : ''}`}
                                  />
                                  <div className="w-28">
                                    <Select
                                      value={piece.unit || 'piezas'}
                                      onValueChange={(val: 'piezas' | 'pares') => updateProductPiece(0, pieceIndex, "unit", val)}
                                    >
                                      <SelectTrigger className="h-10 border-slate-300 dark:border-slate-700 rounded-lg">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="piezas">Piezas</SelectItem>
                                        <SelectItem value="pares">Pares</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>

                              {productos[0].pieces.length > 1 && (
                                <div className="absolute top-2 right-2 md:relative md:top-auto md:right-auto md:mb-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg h-10 w-10 p-0 flex items-center justify-center border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
                                    onClick={() => removeProductPiece(0, pieceIndex)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }



            {/* Autorización y Observaciones */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden hover:border-purple-200 dark:hover:border-purple-900/40 transition-colors">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/40 py-4 px-6">
                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Urgencia y Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nivel de Urgencia *</Label>
                  <Select value={watch('urgencia')} onValueChange={(value: any) => setValue('urgencia', value)}>
                    <SelectTrigger className="h-11 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="observaciones" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Otras Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    {...register('observaciones')}
                    rows={3}
                    placeholder="Comentarios adicionales, instrucciones especiales o aclaraciones..."
                    uppercase={true}
                    className="border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 rounded-lg focus-visible:ring-purple-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Documentos */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden hover:border-purple-200 dark:hover:border-purple-900/40 transition-colors">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/40 py-4 px-6">
                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  Documentos de Soporte
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <FileUpload
                  onFileSelect={setSelectedFiles}
                  label="Documentos de la Reposición"
                  description="Adjunta documentos relacionados (formatos PDF, XML, imágenes hasta 10MB)"
                  maxFiles={5}
                  maxSize={10}
                />
              </CardContent>
            </Card>

            {/* Alerta de tiempo para reposiciones */}
            {
              (() => {
                if (watch('type') === 'reposición' && !repositionId) {
                  const now = new Date();
                  const currentHour = now.getHours();
                  if (currentHour >= 14) {
                    return (
                      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 rounded-xl p-4 mb-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 pt-0.5">
                            <svg className="h-5 w-5 text-amber-500 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                              Horario de Procesamiento Tardío
                            </h3>
                            <div className="mt-1 text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed">
                              <p>
                                Son las <strong>{currentHour}:{now.getMinutes().toString().padStart(2, '0')} hrs</strong>.
                                Tenga en cuenta que las solicitudes creadas después de las 2:00 PM (14:00 hrs) probablemente sean procesadas a partir de mañana a las 8:00 AM.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              })()
            }

            <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="h-11 px-6 rounded-lg font-medium border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createRepositionMutation.isPending}
                className="h-11 px-8 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-500 dark:to-indigo-500 text-white shadow-md shadow-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 transition-all duration-200"
              >
                {createRepositionMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{repositionId ? 'Guardando...' : 'Creando...'}</span>
                  </div>
                ) : (
                  repositionId ? 'Guardar y Reenviar' : 'Crear Solicitud'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}