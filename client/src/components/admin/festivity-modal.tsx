import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { areas } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Paintbrush, 
  Type, 
  Bell, 
  Users as UsersIcon, 
  Sparkles, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeftRight, 
  Palette, 
  Layers, 
  Compass,
  Highlighter,
  Upload,
  Move,
  ZoomIn,
  RotateCcw,
  Maximize2,
  Crosshair
} from "lucide-react";

interface FestivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: any[];
  currentConfig: any;
}

export const PRESET_PALETTES = [
  { name: "Arcoíris", icon: "🌈", colors: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7"] },
  { name: "Fiestas Patrias", icon: "🇲🇽", colors: ["#006847", "#ffffff", "#ce1126"] },
  { name: "Navideño", icon: "🎄", colors: ["#d42426", "#165b33", "#f8b229", "#ffffff"] },
  { name: "Atardecer", icon: "🌅", colors: ["#f43f5e", "#fb923c", "#facc15"] },
  { name: "Océano Azul", icon: "🌊", colors: ["#0284c7", "#38bdf8", "#a5f3fc"] },
  { name: "Neón Púrpura", icon: "💜", colors: ["#7e22ce", "#c026d3", "#f43f5e", "#fb923c"] },
  { name: "Jasana Premium", icon: "✨", colors: ["#4f46e5", "#7c3aed", "#ec4899"] },
  { name: "Oro y Lujo", icon: "👑", colors: ["#78350f", "#b45309", "#f59e0b", "#fde047"] },
  { name: "Pastel Dulce", icon: "🌸", colors: ["#fbcfe8", "#c7d2fe", "#bae6fd", "#bbf7d0"] },
  { name: "Noche Cósmica", icon: "🌌", colors: ["#0f172a", "#312e81", "#581c87", "#831843"] },
];

export const GRADIENT_TYPES = [
  { value: "linear", label: "🌈 Degradado Lineal Suave (Difuminado continuo)" },
  { value: "stripes", label: "🏁 Franjas / Rayas Sólidas (Bloques nítidos / Banderas)" },
  { value: "radial-center", label: "🎯 Radial Circular: Desde el Centro" },
  { value: "radial-top", label: "🌟 Radial Reflector: Desde Arriba" },
  { value: "radial-corner", label: "💫 Radial Esquina: Sup. Izquierda" },
  { value: "conic", label: "🌀 Cónico: Molinete Angular 360°" },
];

export const DIRECTION_OPTIONS = [
  { value: "to right", label: "Horizontal: Izquierda → Derecha" },
  { value: "to left", label: "Horizontal: Derecha → Izquierda" },
  { value: "to bottom", label: "Vertical: Arriba → Abajo" },
  { value: "to top", label: "Vertical: Abajo → Arriba" },
  { value: "to bottom right", label: "Diagonal: Sup. Izq. a Inf. Der. ↘ (135°)" },
  { value: "to bottom left", label: "Diagonal: Sup. Der. a Inf. Izq. ↙ (225°)" },
  { value: "to top right", label: "Diagonal: Inf. Izq. a Sup. Der. ↗ (45°)" },
  { value: "to top left", label: "Diagonal: Inf. Der. a Sup. Izq. ↖ (315°)" },
];

export const generateGradientCss = (
  type: string = "linear",
  direction: string = "to right",
  colors: string[] = ["#ff416c", "#ff4b2b"]
): string => {
  if (!colors || colors.length === 0) return "#d32f2f";
  if (colors.length === 1) return colors[0];

  const colorList = colors.join(", ");

  switch (type) {
    case "radial-center":
      return `radial-gradient(circle at center, ${colorList})`;
    case "radial-top":
      return `radial-gradient(circle at top, ${colorList})`;
    case "radial-corner":
      return `radial-gradient(circle at top left, ${colorList})`;
    case "conic":
      return `conic-gradient(from 0deg at 50% 50%, ${colorList}, ${colors[0]})`;
    case "stripes": {
      const step = 100 / colors.length;
      const stripeStops = colors
        .map((c, i) => `${c} ${(i * step).toFixed(2)}%, ${c} ${((i + 1) * step).toFixed(2)}%`)
        .join(", ");
      return `linear-gradient(${direction || "to right"}, ${stripeStops})`;
    }
    case "linear":
    default:
      return `linear-gradient(${direction || "to right"}, ${colorList})`;
  }
};

export const getTextStrokeStyle = (
  useStroke?: boolean,
  strokeColor: string = "#000000",
  strokeWidth: number | string = 1.5
): React.CSSProperties => {
  if (!useStroke) return {};
  const width = typeof strokeWidth === "number" ? `${strokeWidth}px` : strokeWidth;
  return {
    WebkitTextStroke: `${width} ${strokeColor}`,
    paintOrder: "stroke fill",
    textShadow: `0 0 1px ${strokeColor}, 0 1px 3px rgba(0,0,0,0.5)`,
  };
};

export function FestivityModal({ open, onOpenChange, users, currentConfig }: FestivityModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [messageAlignment, setMessageAlignment] = useState("center");
  
  const [useGradient, setUseGradient] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#d32f2f");
  const [gradientColors, setGradientColors] = useState<string[]>(["#ff416c", "#ff4b2b"]);
  const [gradientType, setGradientType] = useState("linear");
  const [gradientDirection, setGradientDirection] = useState("to right");
  
  const [textColor, setTextColor] = useState("#ffffff");
  const [useMulticolorText, setUseMulticolorText] = useState(false);
  const [customLetterColors, setCustomLetterColors] = useState<string[]>([]);
  const [useTextStroke, setUseTextStroke] = useState(false);
  const [textStrokeColor, setTextStrokeColor] = useState("#000000");
  const [textStrokeWidth, setTextStrokeWidth] = useState(1.5);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [useMessagePill, setUseMessagePill] = useState(false);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [backgroundPositionX, setBackgroundPositionX] = useState(50);
  const [backgroundPositionY, setBackgroundPositionY] = useState(50);
  const [backgroundScale, setBackgroundScale] = useState(100);
  const [backgroundSize, setBackgroundSize] = useState("cover");
  const [animation, setAnimation] = useState("none");
  
  const [floatingEmojis, setFloatingEmojis] = useState("");
  const [emojiAnimation, setEmojiAnimation] = useState("fall");

  const [noteEnabled, setNoteEnabled] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteButtonText, setNoteButtonText] = useState("Ver Sorpresa");
  const [noteBackgroundColor, setNoteBackgroundColor] = useState("#ffffff");
  const [noteUseGradient, setNoteUseGradient] = useState(false);
  const [noteGradientColors, setNoteGradientColors] = useState<string[]>(["#ff416c", "#ff4b2b"]);
  const [noteGradientType, setNoteGradientType] = useState("linear");
  const [noteGradientDirection, setNoteGradientDirection] = useState("to right");
  const [noteOpacity, setNoteOpacity] = useState(100);
  const [noteTextColor, setNoteTextColor] = useState("#333333");
  const [noteBackgroundImage, setNoteBackgroundImage] = useState("");

  const [targetUsers, setTargetUsers] = useState<number[]>([]);
  const [targetAreas, setTargetAreas] = useState<string[]>([]);

  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (open) {
      if (!isInitializedRef.current && currentConfig) {
        setEnabled(currentConfig.enabled !== undefined ? currentConfig.enabled : false);
        setMessage(currentConfig.message || "");
        setMessageAlignment(currentConfig.messageAlignment || "center");
        
        setUseGradient(currentConfig.useGradient !== undefined ? currentConfig.useGradient : false);
        setBackgroundColor(currentConfig.backgroundColor || "#d32f2f");
        
        // Top bar gradient colors & type
        let initialColors = currentConfig.gradientColors;
        if (!initialColors || !Array.isArray(initialColors) || initialColors.length === 0) {
          if (currentConfig.gradientStart && currentConfig.gradientEnd) {
            initialColors = [currentConfig.gradientStart, currentConfig.gradientEnd];
          } else {
            initialColors = ["#ff416c", "#ff4b2b"];
          }
        }
        setGradientColors(initialColors);
        setGradientType(currentConfig.gradientType || "linear");
        setGradientDirection(currentConfig.gradientDirection || "to right");
        
        setTextColor(currentConfig.textColor || "#ffffff");
        setUseMulticolorText(currentConfig.useMulticolorText !== undefined ? currentConfig.useMulticolorText : false);
        setCustomLetterColors(currentConfig.customLetterColors || []);
        setUseTextStroke(currentConfig.useTextStroke !== undefined ? currentConfig.useTextStroke : false);
        setTextStrokeColor(currentConfig.textStrokeColor || "#000000");
        setTextStrokeWidth(currentConfig.textStrokeWidth !== undefined ? currentConfig.textStrokeWidth : 1.5);
        setOverlayOpacity(currentConfig.overlayOpacity !== undefined ? currentConfig.overlayOpacity : 0);
        setUseMessagePill(currentConfig.useMessagePill !== undefined ? currentConfig.useMessagePill : false);
        setFontFamily(currentConfig.fontFamily || "Inter");
        setBackgroundImage(currentConfig.backgroundImage || "");
        setBackgroundPositionX(currentConfig.backgroundPositionX !== undefined ? currentConfig.backgroundPositionX : 50);
        setBackgroundPositionY(currentConfig.backgroundPositionY !== undefined ? currentConfig.backgroundPositionY : 50);
        setBackgroundScale(currentConfig.backgroundScale !== undefined ? currentConfig.backgroundScale : 100);
        setBackgroundSize(currentConfig.backgroundSize || "cover");
        setAnimation(currentConfig.animation || "none");
        
        setFloatingEmojis(currentConfig.floatingEmojis || "");
        setEmojiAnimation(currentConfig.emojiAnimation || "fall");
        
        setNoteEnabled(currentConfig.noteEnabled !== undefined ? currentConfig.noteEnabled : false);
        setNoteTitle(currentConfig.noteTitle || "");
        setNoteContent(currentConfig.noteContent || "");
        setNoteButtonText(currentConfig.noteButtonText || "Ver Sorpresa");
        setNoteBackgroundColor(currentConfig.noteBackgroundColor || "#ffffff");
        setNoteUseGradient(currentConfig.noteUseGradient !== undefined ? currentConfig.noteUseGradient : false);
        
        // Note gradient colors & type
        let initialNoteColors = currentConfig.noteGradientColors;
        if (!initialNoteColors || !Array.isArray(initialNoteColors) || initialNoteColors.length === 0) {
          if (currentConfig.noteGradientStart && currentConfig.noteGradientEnd) {
            initialNoteColors = [currentConfig.noteGradientStart, currentConfig.noteGradientEnd];
          } else {
            initialNoteColors = ["#ff416c", "#ff4b2b"];
          }
        }
        setNoteGradientColors(initialNoteColors);
        setNoteGradientType(currentConfig.noteGradientType || "linear");
        setNoteGradientDirection(currentConfig.noteGradientDirection || "to right");
        
        setNoteOpacity(currentConfig.noteOpacity !== undefined ? currentConfig.noteOpacity : 100);
        setNoteTextColor(currentConfig.noteTextColor || "#333333");
        setNoteBackgroundImage(currentConfig.noteBackgroundImage || "");

        setTargetUsers(currentConfig.targetUsers || []);
        setTargetAreas(currentConfig.targetAreas || []);

        isInitializedRef.current = true;
      }
    } else {
      isInitializedRef.current = false;
    }
  }, [open, currentConfig]);

  const saveMutation = useMutation({
    mutationFn: async (config: any) => {
      const res = await apiRequest("POST", "/api/settings", {
        key: "festivity_config",
        value: JSON.stringify(config)
      });
      if (!res.ok) throw new Error("Error al guardar configuración");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/festivity_config"] });
      queryClient.refetchQueries({ queryKey: ["/api/settings/festivity_config"] });
      toast({ title: "Configuración guardada exitosamente" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo guardar la configuración", variant: "destructive" });
    }
  });

  const uploadHeaderBgMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Error al subir imagen");
      const data = await res.json();
      return data.url;
    },
    onSuccess: (url) => {
      setBackgroundImage(url);
      toast({ title: "Imagen de fondo subida exitosamente" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo subir la imagen de fondo", variant: "destructive" });
    }
  });

  const uploadNoteBgMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("token") || "";
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Error al subir imagen");
      const data = await res.json();
      return data.url;
    },
    onSuccess: (url) => {
      setNoteBackgroundImage(url);
      toast({ title: "Imagen de la nota subida exitosamente" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo subir la imagen de la nota", variant: "destructive" });
    }
  });

  const handleHeaderBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadHeaderBgMutation.mutate(e.target.files[0]);
    }
  };

  const handleNoteBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadNoteBgMutation.mutate(e.target.files[0]);
    }
  };

  // Top Bar Color Handlers
  const handleColorChange = (index: number, newColor: string) => {
    setGradientColors(prev => {
      const updated = [...prev];
      updated[index] = newColor;
      return updated;
    });
  };

  const handleAddColor = () => {
    const paletteExtras = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#8b5cf6", "#f43f5e", "#14b8a6", "#fb923c"];
    const nextColor = paletteExtras[gradientColors.length % paletteExtras.length];
    setGradientColors(prev => [...prev, nextColor]);
  };

  const handleRemoveColor = (index: number) => {
    if (gradientColors.length <= 2) {
      toast({
        title: "Mínimo 2 colores",
        description: "Un degradado requiere al menos 2 colores.",
        variant: "destructive"
      });
      return;
    }
    setGradientColors(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveColor = (index: number, direction: "up" | "down") => {
    setGradientColors(prev => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleReverseColors = () => {
    setGradientColors(prev => [...prev].reverse());
  };

  const applyPalette = (colors: string[]) => {
    setGradientColors([...colors]);
  };

  // Note Color Handlers
  const handleNoteColorChange = (index: number, newColor: string) => {
    setNoteGradientColors(prev => {
      const updated = [...prev];
      updated[index] = newColor;
      return updated;
    });
  };

  const handleAddNoteColor = () => {
    const paletteExtras = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#8b5cf6", "#f43f5e", "#14b8a6", "#fb923c"];
    const nextColor = paletteExtras[noteGradientColors.length % paletteExtras.length];
    setNoteGradientColors(prev => [...prev, nextColor]);
  };

  const handleRemoveNoteColor = (index: number) => {
    if (noteGradientColors.length <= 2) return;
    setNoteGradientColors(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveNoteColor = (index: number, direction: "up" | "down") => {
    setNoteGradientColors(prev => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleReverseNoteColors = () => {
    setNoteGradientColors(prev => [...prev].reverse());
  };

  const handleSave = () => {
    saveMutation.mutate({
      enabled,
      message,
      messageAlignment,
      useGradient,
      backgroundColor,
      gradientColors,
      gradientType,
      gradientDirection,
      gradientStart: gradientColors[0] || "#ff416c",
      gradientEnd: gradientColors[gradientColors.length - 1] || "#ff4b2b",
      textColor,
      useMulticolorText,
      customLetterColors,
      useTextStroke,
      textStrokeColor,
      textStrokeWidth,
      overlayOpacity,
      useMessagePill,
      fontFamily,
      backgroundImage,
      backgroundPositionX,
      backgroundPositionY,
      backgroundScale,
      backgroundSize,
      animation,
      floatingEmojis,
      emojiAnimation,
      noteEnabled,
      noteTitle,
      noteContent,
      noteButtonText,
      noteBackgroundColor,
      noteUseGradient,
      noteGradientColors,
      noteGradientType,
      noteGradientDirection,
      noteGradientStart: noteGradientColors[0] || "#ff416c",
      noteGradientEnd: noteGradientColors[noteGradientColors.length - 1] || "#ff4b2b",
      noteOpacity,
      noteTextColor,
      noteBackgroundImage,
      targetUsers,
      targetAreas
    });
  };

  const toggleUser = (userId: number) => {
    setTargetUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const toggleArea = (area: string) => {
    setTargetAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  };

  const selectAllUsers = () => {
    if (targetUsers.length === users.length) {
      setTargetUsers([]);
    } else {
      setTargetUsers(users.map(u => u.id));
    }
  };

  const fonts = [
    { value: "Inter", label: "Inter (Por Defecto)" },
    { value: "Dancing Script", label: "Dancing Script (Cursiva Elegante)" },
    { value: "Pacifico", label: "Pacifico (Retro/Divertida)" },
    { value: "Cinzel", label: "Cinzel (Clásica/Serif)" },
    { value: "Mountains of Christmas", label: "Navidad" },
    { value: "Creepster", label: "Halloween" }
  ];

  const animations = [
    { value: "none", label: "Sin Animación" },
    { value: "snow", label: "Nieve Cayendo" },
    { value: "sparkle", label: "Destellos" },
    { value: "glow-pulse", label: "Pulso Brillante" }
  ];

  const getBackgroundStyle = () => {
    if (backgroundImage) {
      return { 
        backgroundImage: `url(${backgroundImage})`, 
        backgroundSize: backgroundSize === 'custom' ? `${backgroundScale}%` : backgroundSize,
        backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`,
        backgroundRepeat: 'no-repeat'
      };
    }
    if (useGradient) return { background: generateGradientCss(gradientType, gradientDirection, gradientColors) };
    return { backgroundColor };
  };

  const textStrokeStyle = getTextStrokeStyle(useTextStroke, textStrokeColor, textStrokeWidth);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-pink-200 dark:border-pink-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2 text-pink-600 dark:text-pink-400">
            <Sparkles className="w-6 h-6" />
            Configuración de Festividades
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 p-4 rounded-xl border border-pink-100 dark:border-pink-900/30">
            <div>
              <Label className="text-lg font-bold text-slate-800 dark:text-slate-200">Activar Temática</Label>
              <p className="text-sm text-slate-500">Aplica este diseño a la barra superior de los usuarios seleccionados.</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} className="data-[state=checked]:bg-pink-600" />
          </div>

          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="appearance" className="flex items-center gap-2"><Paintbrush className="w-4 h-4"/> Apariencia</TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2"><Type className="w-4 h-4"/> Contenido</TabsTrigger>
              <TabsTrigger value="note" className="flex items-center gap-2"><Bell className="w-4 h-4"/> Nota Extra</TabsTrigger>
              <TabsTrigger value="audience" className="flex items-center gap-2"><UsersIcon className="w-4 h-4"/> Audiencia</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4 border p-4 rounded-xl dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Fondo: Usar Degradado</Label>
                    <Switch checked={useGradient} onCheckedChange={setUseGradient} />
                  </div>
                  
                  {useGradient ? (
                    <div className="space-y-4">
                      {/* Tira de Vista Previa del Degradado */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5 text-pink-500" />
                            Vista Previa del Degradado
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {gradientColors.length} colores configurados
                          </span>
                        </div>
                        <div 
                          className="h-7 w-full rounded-lg border shadow-inner transition-all duration-300"
                          style={{ background: generateGradientCss(gradientType, gradientDirection, gradientColors) }}
                        />
                      </div>

                      {/* Estilo de Acomodo y Orientación */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            Estilo / Acomodo
                          </Label>
                          <Select value={gradientType} onValueChange={setGradientType}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {GRADIENT_TYPES.map(gt => (
                                <SelectItem key={gt.value} value={gt.value} className="text-xs">
                                  {gt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {(gradientType === "linear" || gradientType === "stripes") ? (
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold flex items-center gap-1">
                              <Compass className="w-3.5 h-3.5 text-purple-500" />
                              Orientación / Dirección
                            </Label>
                            <Select value={gradientDirection} onValueChange={setGradientDirection}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {DIRECTION_OPTIONS.map(dir => (
                                  <SelectItem key={dir.value} value={dir.value} className="text-xs">
                                    {dir.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-400">Efecto Especial</Label>
                            <div className="h-8 flex items-center px-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border text-xs text-slate-500">
                              Forma geométrica activa
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Paletas Rápidas Prediseñadas */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Paletas Rápidas (1 Clic)
                        </Label>
                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 max-h-24 overflow-y-auto">
                          {PRESET_PALETTES.map((palette) => (
                            <Button
                              key={palette.name}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => applyPalette(palette.colors)}
                              className="h-6 px-2 py-0 text-[11px] font-medium flex items-center gap-1.5 hover:bg-pink-50 hover:border-pink-300 dark:hover:bg-pink-950/30 transition-all"
                              title={`Aplicar paleta ${palette.name}`}
                            >
                              <span>{palette.icon}</span>
                              <span>{palette.name}</span>
                              <div className="flex -space-x-1 ml-0.5">
                                {palette.colors.slice(0, 3).map((c, i) => (
                                  <div key={i} className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900" style={{ backgroundColor: c }} />
                                ))}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Lista Dinámica de Colores */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Colores del Degradado ({gradientColors.length})
                          </Label>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleReverseColors}
                              className="h-6 px-2 text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
                              title="Invertir el orden de los colores"
                            >
                              <ArrowLeftRight className="w-3 h-3" />
                              Invertir
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={handleAddColor}
                              className="h-6 px-2.5 text-[11px] bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-950/50 dark:text-pink-300 font-semibold flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Agregar Color
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {gradientColors.map((color, index) => (
                            <div 
                              key={index}
                              className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80 transition-all hover:border-slate-300"
                            >
                              <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-mono shrink-0 bg-white dark:bg-slate-900">
                                #{index + 1}
                              </Badge>

                              {/* Color Swatch Picker */}
                              <div className="relative shrink-0">
                                <input
                                  type="color"
                                  value={color}
                                  onChange={e => handleColorChange(index, e.target.value)}
                                  className="w-7 h-7 rounded-md cursor-pointer border border-slate-300 dark:border-slate-600 p-0 bg-transparent overflow-hidden"
                                  title={`Cambiar Color #${index + 1}`}
                                />
                              </div>

                              {/* Hex Input */}
                              <Input
                                type="text"
                                value={color}
                                onChange={e => handleColorChange(index, e.target.value)}
                                className="h-7 text-xs font-mono w-24 shrink-0 uppercase"
                                placeholder="#FFFFFF"
                              />

                              {/* Mini preview bar for this color */}
                              <div 
                                className="flex-1 h-5 rounded border border-slate-200 dark:border-slate-700 shadow-inner"
                                style={{ backgroundColor: color }}
                              />

                              {/* Reorder / Action Buttons */}
                              <div className="flex items-center gap-0.5 shrink-0">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={index === 0}
                                  onClick={() => handleMoveColor(index, "up")}
                                  className="h-6 w-6 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                  title="Mover arriba"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={index === gradientColors.length - 1}
                                  onClick={() => handleMoveColor(index, "down")}
                                  className="h-6 w-6 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                  title="Mover abajo"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={gradientColors.length <= 2}
                                  onClick={() => handleRemoveColor(index)}
                                  className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30"
                                  title={gradientColors.length <= 2 ? "Se requiere un mínimo de 2 colores" : "Eliminar este color"}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Color de Fondo Sólido</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-16 p-1 h-10" />
                        <Input type="text" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="flex-1" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t dark:border-slate-800">
                    <Label className="text-xs font-semibold">Imagen de Fondo de la Barra (Prioridad sobre colores)</Label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        value={backgroundImage} 
                        onChange={e => setBackgroundImage(e.target.value)} 
                        placeholder="Ej: https://.../fondo.jpg o sube un archivo desde tu laptop" 
                        className="flex-1 text-xs"
                      />
                      <div className="relative">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleHeaderBgUpload} 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadHeaderBgMutation.isPending}
                        />
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="sm" 
                          className="pointer-events-none whitespace-nowrap h-9 font-medium flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {uploadHeaderBgMutation.isPending ? "Subiendo..." : "Subir Imagen"}
                        </Button>
                      </div>
                    </div>

                    {backgroundImage && (
                      <div className="mt-3 space-y-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
                        <div className="text-xs text-slate-500 flex justify-between items-center">
                          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            <Move className="w-3.5 h-3.5 text-pink-500" />
                            Acomodar y Encuadrar Imagen de Fondo
                          </span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                            onClick={() => setBackgroundImage("")}
                          >
                            Eliminar Imagen
                          </Button>
                        </div>

                        {/* Live Framing Box */}
                        <div 
                          className="relative w-full h-20 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-900 shadow-inner transition-all duration-150"
                          style={{
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`,
                            backgroundSize: backgroundSize === 'custom' ? `${backgroundScale}%` : backgroundSize,
                            backgroundRepeat: 'no-repeat'
                          }}
                        >
                          <div className="absolute top-1 left-2 bg-black/60 backdrop-blur-sm text-[10px] text-white px-1.5 py-0.5 rounded font-mono">
                            Posición: X: {backgroundPositionX}% | Y: {backgroundPositionY}%
                          </div>
                        </div>

                        {/* Grid de Posiciones Rápidas 3x3 */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <Label className="text-[11px] font-semibold flex items-center gap-1 text-slate-600 dark:text-slate-300">
                              <Crosshair className="w-3 h-3 text-indigo-500" />
                              Posiciones Rápidas:
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-5 px-2 text-[10px] flex items-center gap-1"
                              onClick={() => { setBackgroundPositionX(50); setBackgroundPositionY(50); setBackgroundScale(100); setBackgroundSize("cover"); }}
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              Restablecer
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-1 max-w-[280px]">
                            {[
                              { label: "↖ Arriba Izq", x: 0, y: 0 },
                              { label: "⬆ Arriba", x: 50, y: 0 },
                              { label: "↗ Arriba Der", x: 100, y: 0 },
                              { label: "⬅ Izquierda", x: 0, y: 50 },
                              { label: "🎯 Centro", x: 50, y: 50 },
                              { label: "➡ Derecha", x: 100, y: 50 },
                              { label: "↙ Abajo Izq", x: 0, y: 100 },
                              { label: "⬇ Abajo", x: 50, y: 100 },
                              { label: "↘ Abajo Der", x: 100, y: 100 },
                            ].map(pos => (
                              <Button
                                key={pos.label}
                                type="button"
                                variant={backgroundPositionX === pos.x && backgroundPositionY === pos.y ? "default" : "outline"}
                                size="sm"
                                className="h-6 text-[10px] px-1 py-0"
                                onClick={() => { setBackgroundPositionX(pos.x); setBackgroundPositionY(pos.y); }}
                              >
                                {pos.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Sliders de Desplazamiento Fino */}
                        <div className="space-y-2 pt-2 border-t dark:border-slate-700/60">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <Label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                Horizontal (Izquierda ↔ Derecha): <span className="font-mono font-bold text-pink-600">{backgroundPositionX}%</span>
                              </Label>
                            </div>
                            <Input 
                              type="range" 
                              min="0" 
                              max="100" 
                              step="1" 
                              value={backgroundPositionX} 
                              onChange={e => setBackgroundPositionX(parseInt(e.target.value))} 
                              className="h-5 cursor-pointer" 
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <Label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                Vertical (Arriba ↕ Abajo): <span className="font-mono font-bold text-pink-600">{backgroundPositionY}%</span>
                              </Label>
                            </div>
                            <Input 
                              type="range" 
                              min="0" 
                              max="100" 
                              step="1" 
                              value={backgroundPositionY} 
                              onChange={e => setBackgroundPositionY(parseInt(e.target.value))} 
                              className="h-5 cursor-pointer" 
                            />
                          </div>

                          {/* Escala / Zoom */}
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between items-center">
                              <Label className="text-[11px] font-medium flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                <ZoomIn className="w-3 h-3 text-purple-500" />
                                Zoom / Tamaño ({backgroundSize === 'custom' ? `${backgroundScale}%` : backgroundSize === 'cover' ? 'Cubrir todo' : 'Ajustar'}):
                              </Label>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant={backgroundSize === 'cover' ? 'default' : 'outline'}
                                  size="sm"
                                  className="h-5 px-1.5 text-[10px]"
                                  onClick={() => { setBackgroundSize('cover'); }}
                                >
                                  Cubrir
                                </Button>
                                <Button
                                  type="button"
                                  variant={backgroundSize === 'contain' ? 'default' : 'outline'}
                                  size="sm"
                                  className="h-5 px-1.5 text-[10px]"
                                  onClick={() => { setBackgroundSize('contain'); }}
                                >
                                  Ajustar
                                </Button>
                                <Button
                                  type="button"
                                  variant={backgroundSize === 'custom' ? 'default' : 'outline'}
                                  size="sm"
                                  className="h-5 px-1.5 text-[10px]"
                                  onClick={() => { setBackgroundSize('custom'); }}
                                >
                                  Zoom
                                </Button>
                              </div>
                            </div>
                            {backgroundSize === 'custom' && (
                              <Input 
                                type="range" 
                                min="50" 
                                max="250" 
                                step="5" 
                                value={backgroundScale} 
                                onChange={e => setBackgroundScale(parseInt(e.target.value))} 
                                className="h-5 cursor-pointer mt-1" 
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Filtro Oscurecedor / Sombreado de Fondo para Contraste */}
                    <div className="space-y-1.5 pt-2 border-t dark:border-slate-800">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-semibold">Filtro de Contraste / Sombreado ({overlayOpacity}%)</Label>
                        <span className="text-[10px] text-slate-400">0% a 70%</span>
                      </div>
                      <Input 
                        type="range" 
                        min="0" 
                        max="70" 
                        step="5" 
                        value={overlayOpacity} 
                        onChange={e => setOverlayOpacity(parseInt(e.target.value))} 
                        className="h-6 cursor-pointer" 
                      />
                      <p className="text-[10px] text-slate-400">Oscurece sutilmente el fondo para que los textos e iconos resalten perfectamente.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border p-4 rounded-xl dark:border-slate-800">
                  <div className="space-y-2">
                    <Label>Efectos Animados CSS</Label>
                    <Select value={animation} onValueChange={setAnimation}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {animations.map(anim => (
                          <SelectItem key={anim.value} value={anim.value}>{anim.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 pt-2 border-t dark:border-slate-800">
                    <Label>Emojis Flotantes (Ingresa emojis separados por espacio)</Label>
                    <Input value={floatingEmojis} onChange={e => setFloatingEmojis(e.target.value)} placeholder="Ej: 🎈 🎂 🎁 ❄️" />
                    {floatingEmojis && (
                       <div className="space-y-2 mt-2">
                         <Label className="text-xs">Dirección de los Emojis</Label>
                         <Select value={emojiAnimation} onValueChange={setEmojiAnimation}>
                           <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="fall">Caer (Nieve/Confeti) ↓</SelectItem>
                             <SelectItem value="rise">Subir (Burbujas/Globos) ↑</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4 border p-4 rounded-xl dark:border-slate-800">
                  <div className="space-y-2">
                    <Label>Mensaje Temático</Label>
                    <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Ej. ¡Feliz Navidad Equipo!" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Alineación del Mensaje</Label>
                    <Select value={messageAlignment} onValueChange={setMessageAlignment}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Izquierda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Derecha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4 border p-4 rounded-xl dark:border-slate-800">
                  <div className="space-y-2">
                    <Label>Fuente (Tipo de Letra)</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {fonts.map(font => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4 pt-2 border-t dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <Label>Letras Multicolores (Ej. Cumpleaños)</Label>
                      <Switch checked={useMulticolorText} onCheckedChange={setUseMulticolorText} />
                    </div>
                    
                    {useMulticolorText && message.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Personalizar colores de cada letra:</Label>
                        <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                          {message.split('').map((char, index) => {
                            if (char.trim() === '') return null;
                            const defaultColor = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'][index % 8];
                            const currentColor = customLetterColors[index] || defaultColor;
                            return (
                              <div key={index} className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold font-mono text-slate-600 dark:text-slate-400">{char}</span>
                                <Input 
                                  type="color" 
                                  value={currentColor}
                                  onChange={e => {
                                    const newColors = [...customLetterColors];
                                    for (let i = 0; i <= index; i++) {
                                      if (!newColors[i]) newColors[i] = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'][i % 8];
                                    }
                                    newColors[index] = e.target.value;
                                    setCustomLetterColors(newColors);
                                  }} 
                                  className="w-6 h-6 p-0 border-0 cursor-pointer rounded-full overflow-hidden" 
                                  title={`Color para "${char}"`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {!useMulticolorText && (
                      <div className="space-y-2">
                        <Label>Color de Texto Principal</Label>
                        <div className="flex gap-2">
                          <Input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-16 p-1 h-10" />
                          <Input type="text" value={textColor} onChange={e => setTextColor(e.target.value)} className="flex-1" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Delineado / Contorno de Letras */}
                  <div className="space-y-3 pt-3 border-t dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-semibold text-sm flex items-center gap-1.5">
                          <Highlighter className="w-4 h-4 text-amber-500" />
                          Delineado / Borde de Letras
                        </Label>
                        <p className="text-[11px] text-slate-500">Agrega un contorno para que el texto resalte sobre fondos blancos o degradados.</p>
                      </div>
                      <Switch checked={useTextStroke} onCheckedChange={setUseTextStroke} />
                    </div>

                    {useTextStroke && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 animate-in fade-in duration-200">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Color del Delineado</Label>
                          <div className="flex gap-2 items-center">
                            <Input 
                              type="color" 
                              value={textStrokeColor} 
                              onChange={e => setTextStrokeColor(e.target.value)} 
                              className="w-8 h-8 p-0.5 rounded cursor-pointer shrink-0" 
                            />
                            <Input 
                              type="text" 
                              value={textStrokeColor} 
                              onChange={e => setTextStrokeColor(e.target.value)} 
                              className="h-8 text-xs font-mono uppercase" 
                              placeholder="#000000"
                            />
                          </div>
                          {/* Colores rápidos para delineado */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {[
                              { label: "Negro", color: "#000000" },
                              { label: "Blanco", color: "#ffffff" },
                              { label: "Dorado", color: "#b45309" },
                              { label: "Azul Marino", color: "#0f172a" },
                            ].map(quick => (
                              <Button
                                key={quick.color}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setTextStrokeColor(quick.color)}
                                className="h-5 px-1.5 text-[10px] flex items-center gap-1"
                              >
                                <span className="w-2 h-2 rounded-full border border-slate-400" style={{ backgroundColor: quick.color }} />
                                {quick.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-semibold">Grosor del Delineado ({textStrokeWidth}px)</Label>
                            <span className="text-[10px] text-slate-400">0.5px - 4px</span>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <Input 
                              type="range" 
                              min="0.5" 
                              max="4" 
                              step="0.5" 
                              value={textStrokeWidth} 
                              onChange={e => setTextStrokeWidth(parseFloat(e.target.value))} 
                              className="h-6 flex-1 cursor-pointer" 
                            />
                            <span className="text-xs font-mono w-10 text-right">{textStrokeWidth}px</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Recomendado: 1.5px - 2px para máxima legibilidad</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cápsula de Cristal Translúcida para el Mensaje */}
                  <div className="space-y-2 pt-3 border-t dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-semibold text-sm">Cápsula de Cristal para el Mensaje</Label>
                        <p className="text-[11px] text-slate-500">Enmarca el mensaje en una píldora de cristal oscuro esmerilado para máxima legibilidad.</p>
                      </div>
                      <Switch checked={useMessagePill} onCheckedChange={setUseMessagePill} />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="note" className="space-y-4">
              <div className="border p-4 rounded-xl dark:border-slate-800 space-y-4">
                <div 
                  className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  onClick={() => setNoteEnabled(!noteEnabled)}
                >
                  <div className="pointer-events-none">
                    <Label className="font-bold text-blue-900 dark:text-blue-300">Activar Nota Interactiva</Label>
                    <p className="text-xs text-blue-700 dark:text-blue-400">Muestra un botón junto al mensaje que abre un aviso completo.</p>
                  </div>
                  <Switch 
                    checked={noteEnabled} 
                    onCheckedChange={setNoteEnabled}
                    className="pointer-events-none" 
                  />
                </div>

                {noteEnabled && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                      <Label>Texto del Botón</Label>
                      <Input value={noteButtonText} onChange={e => setNoteButtonText(e.target.value)} placeholder="Ej: Ver Sorpresa 🎁" />
                    </div>
                    <div className="space-y-2">
                      <Label>Título de la Nota</Label>
                      <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Ej: ¡Felicidades en tu día!" />
                    </div>
                    <div className="space-y-2">
                      <Label>Contenido de la Nota</Label>
                      <Textarea 
                        value={noteContent} 
                        onChange={e => setNoteContent(e.target.value)} 
                        placeholder="Escribe aquí el mensaje detallado..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="pt-4 border-t dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="font-bold">Nota: Usar Degradado</Label>
                        <Switch checked={noteUseGradient} onCheckedChange={setNoteUseGradient} />
                      </div>

                      {noteUseGradient ? (
                        <div className="space-y-4">
                          {/* Vista Previa Nota Degradado */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Palette className="w-3.5 h-3.5 text-blue-500" />
                                Vista Previa del Degradado de la Nota
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {noteGradientColors.length} colores
                              </span>
                            </div>
                            <div 
                              className="h-7 w-full rounded-lg border shadow-inner transition-all duration-300"
                              style={{ background: generateGradientCss(noteGradientType, noteGradientDirection, noteGradientColors) }}
                            />
                          </div>

                          {/* Estilo y Orientación */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Estilo / Acomodo</Label>
                              <Select value={noteGradientType} onValueChange={setNoteGradientType}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {GRADIENT_TYPES.map(gt => (
                                    <SelectItem key={gt.value} value={gt.value} className="text-xs">
                                      {gt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {(noteGradientType === "linear" || noteGradientType === "stripes") && (
                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Orientación / Dirección</Label>
                                <Select value={noteGradientDirection} onValueChange={setNoteGradientDirection}>
                                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {DIRECTION_OPTIONS.map(dir => (
                                      <SelectItem key={dir.value} value={dir.value} className="text-xs">
                                        {dir.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>

                          {/* Paletas Rápidas para la Nota */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Paletas Rápidas</Label>
                            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 max-h-20 overflow-y-auto">
                              {PRESET_PALETTES.map((palette) => (
                                <Button
                                  key={palette.name}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setNoteGradientColors([...palette.colors])}
                                  className="h-6 px-2 py-0 text-[11px] font-medium flex items-center gap-1.5"
                                >
                                  <span>{palette.icon}</span>
                                  <span>{palette.name}</span>
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Lista Dinámica de Colores de la Nota */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-semibold">Colores de la Tarjeta ({noteGradientColors.length})</Label>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleReverseNoteColors}
                                  className="h-6 px-2 text-[11px] text-slate-500"
                                >
                                  <ArrowLeftRight className="w-3 h-3" />
                                  Invertir
                                </Button>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={handleAddNoteColor}
                                  className="h-6 px-2 text-[11px] bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950/50 dark:text-blue-300 font-semibold flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  Agregar Color
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                              {noteGradientColors.map((color, index) => (
                                <div key={index} className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80">
                                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-mono shrink-0">#{index + 1}</Badge>
                                  <input
                                    type="color"
                                    value={color}
                                    onChange={e => handleNoteColorChange(index, e.target.value)}
                                    className="w-7 h-7 rounded-md cursor-pointer border p-0 bg-transparent shrink-0"
                                  />
                                  <Input
                                    type="text"
                                    value={color}
                                    onChange={e => handleNoteColorChange(index, e.target.value)}
                                    className="h-7 text-xs font-mono w-24 shrink-0 uppercase"
                                  />
                                  <div className="flex-1 h-5 rounded border shadow-inner" style={{ backgroundColor: color }} />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={index === 0}
                                    onClick={() => handleMoveNoteColor(index, "up")}
                                    className="h-6 w-6 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={index === noteGradientColors.length - 1}
                                    onClick={() => handleMoveNoteColor(index, "down")}
                                    className="h-6 w-6 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={noteGradientColors.length <= 2}
                                    onClick={() => handleRemoveNoteColor(index)}
                                    className="h-6 w-6 text-red-400 hover:text-red-600 disabled:opacity-30"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Color de Fondo de Tarjeta</Label>
                            <div className="flex gap-2">
                              <Input type="color" value={noteBackgroundColor} onChange={e => setNoteBackgroundColor(e.target.value)} className="w-12 p-1 h-8" />
                              <Input type="text" value={noteBackgroundColor} onChange={e => setNoteBackgroundColor(e.target.value)} className="h-8 text-xs flex-1" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Color de Texto de Tarjeta</Label>
                            <div className="flex gap-2">
                              <Input type="color" value={noteTextColor} onChange={e => setNoteTextColor(e.target.value)} className="w-12 p-1 h-8" />
                              <Input type="text" value={noteTextColor} onChange={e => setNoteTextColor(e.target.value)} className="h-8 text-xs flex-1" />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 pt-2 border-t dark:border-slate-800">
                        <div className="flex justify-between">
                          <Label className="text-xs">Opacidad del Fondo ({noteOpacity}%)</Label>
                          <span className="text-[10px] text-slate-400">Ajusta la transparencia</span>
                        </div>
                        <Input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={noteOpacity} 
                          onChange={e => setNoteOpacity(parseInt(e.target.value))} 
                          className="h-6" 
                        />
                      </div>

                      {noteUseGradient && (
                        <div className="space-y-2">
                          <Label className="text-xs">Color de Texto de Tarjeta</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={noteTextColor} onChange={e => setNoteTextColor(e.target.value)} className="w-12 p-1 h-8" />
                            <Input type="text" value={noteTextColor} onChange={e => setNoteTextColor(e.target.value)} className="h-8 text-xs flex-1" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Imagen Adjunta (URL o Subir Archivo)</Label>
                      <div className="flex gap-2 items-center">
                        <Input 
                          value={noteBackgroundImage} 
                          onChange={e => setNoteBackgroundImage(e.target.value)} 
                          placeholder="Ej: https://.../imagen.jpg o sube un archivo" 
                          className="flex-1"
                        />
                        <div className="relative">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleNoteBgUpload} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadNoteBgMutation.isPending}
                          />
                          <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm" 
                            className="pointer-events-none whitespace-nowrap h-9 font-medium flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            {uploadNoteBgMutation.isPending ? "Subiendo..." : "Subir Imagen"}
                          </Button>
                        </div>
                      </div>
                      {noteBackgroundImage && (
                        <div className="mt-2 space-y-2">
                          <div className="text-xs text-slate-500 flex justify-between items-center">
                            <span>Vista previa de imagen adjunta:</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setNoteBackgroundImage("")}
                            >
                              Eliminar
                            </Button>
                          </div>
                          <div className="relative w-full h-32 rounded-lg overflow-hidden flex items-center justify-center">
                            <img 
                              src={noteBackgroundImage} 
                              alt="Preview" 
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=Error+al+cargar+imagen';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="audience" className="space-y-4">
              <div className="border p-4 rounded-xl dark:border-slate-800 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Por Área de Trabajo</Label>
                  <div className="flex flex-wrap gap-2">
                    {areas.map((area: string) => (
                      <Badge 
                        key={area}
                        variant={targetAreas.includes(area) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleArea(area)}
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-pink-600 dark:text-pink-400">Usuarios Específicos</Label>
                    <Button variant="ghost" size="sm" onClick={selectAllUsers} className="h-6 text-xs">
                      {targetUsers.length === users.length ? "Deseleccionar Todos" : "Seleccionar Todos"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-2 rounded shadow-sm">
                        <Checkbox 
                          id={`user-${user.id}`} 
                          checked={targetUsers.includes(user.id)}
                          onCheckedChange={() => toggleUser(user.id)}
                        />
                        <Label htmlFor={`user-${user.id}`} className="text-xs truncate cursor-pointer flex-1">
                          {user.name} <span className="text-slate-400">({user.area})</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Vista Previa en Vivo */}
          <div className="space-y-4 border-t pt-4 dark:border-slate-800">
            <Label className="text-xs font-bold text-slate-500 uppercase">Vista Previa</Label>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] text-slate-400 uppercase">Barra Superior</Label>
                <div 
                  className={`h-16 flex items-center justify-between px-3 md:px-5 rounded-xl shadow-inner border overflow-hidden relative ${animation !== 'none' && !['emoji-fall', 'emoji-rise'].includes(animation) ? `animate-${animation}` : ''}`}
                  style={getBackgroundStyle()}
                >
                  {/* Capa de contraste en vista previa */}
                  {overlayOpacity > 0 && (
                    <div 
                      className="absolute inset-0 z-0 pointer-events-none"
                      style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})` }}
                    />
                  )}

                  {/* Left Mock Capsule */}
                  <div className="flex items-center gap-1.5 bg-black/45 dark:bg-black/60 backdrop-blur-md border border-white/25 text-white px-2.5 py-1 rounded-full text-xs shadow z-10 shrink-0">
                    <span className="font-semibold text-white text-[10px] drop-shadow-sm">Área:</span>
                    <Badge className="text-[9px] px-1.5 py-0 font-semibold uppercase bg-indigo-600 text-white border-0">ADMIN</Badge>
                  </div>

                  {/* Center Message */}
                  <div className={`flex-1 flex items-center px-2 z-10 ${messageAlignment === 'left' ? 'justify-start' : messageAlignment === 'right' ? 'justify-end' : 'justify-center'}`}>
                    <div className={useMessagePill ? "bg-black/40 backdrop-blur-md border border-white/25 px-3 py-1 rounded-xl shadow-md flex items-center gap-3" : "flex items-center gap-3"}>
                      <h2 
                        className="text-xl md:text-2xl font-extrabold tracking-tight drop-shadow-md flex items-center gap-3 whitespace-nowrap" 
                        style={{ 
                          color: useMulticolorText ? undefined : textColor, 
                          fontFamily: fontFamily !== 'Inter' ? `"${fontFamily}", sans-serif` : undefined,
                          ...textStrokeStyle
                        }}
                      >
                        <div className="flex">
                          {useMulticolorText ? (
                            (message || "Vista Previa").split('').map((char, i) => (
                              <span 
                                key={i} 
                                style={{ 
                                  color: char.trim() ? (customLetterColors[i] || ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'][i % 8]) : undefined,
                                  ...textStrokeStyle
                                }}
                              >
                                {char === ' ' ? '\u00A0' : char}
                              </span>
                            ))
                          ) : (
                            message || "Vista Previa"
                          )}
                        </div>
                        {noteEnabled && (
                          <Button size="sm" variant="secondary" className="h-6 text-[10px] font-sans rounded-full bg-white/25 text-white border border-white/30 backdrop-blur-sm pointer-events-none shadow-md font-bold">
                            {noteButtonText}
                          </Button>
                        )}
                      </h2>
                    </div>
                  </div>

                  {/* Right Mock Controls */}
                  <div className="flex items-center gap-1.5 bg-black/45 dark:bg-black/60 backdrop-blur-md border border-white/25 p-1 pl-2 rounded-full shadow text-white z-10 shrink-0 text-xs">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">🌙</div>
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">🔔</div>
                    <div className="h-5 px-1.5 rounded-full bg-white/10 text-[10px] font-bold flex items-center gap-1">
                      <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 text-[8px] flex items-center justify-center font-bold text-white">A</div>
                      <span className="hidden sm:inline">ADMIN</span>
                    </div>
                  </div>
                </div>
              </div>

              {noteEnabled && (
                <div className="space-y-2">
                  <Label className="text-[10px] text-slate-400 uppercase">Nota Interactiva</Label>
                  <div className="relative rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[150px]">
                    <div 
                      className="absolute inset-0 z-0 transition-all duration-300"
                      style={{
                        background: noteUseGradient 
                          ? generateGradientCss(noteGradientType, noteGradientDirection, noteGradientColors)
                          : noteBackgroundColor,
                        opacity: noteOpacity / 100,
                      }}
                    />
                    <div 
                      className="relative z-10 p-6 flex flex-col items-center justify-center text-center gap-2 h-full"
                      style={{ color: noteTextColor }}
                    >
                      <h3 className="text-xl font-bold" style={{ fontFamily: fontFamily !== 'Inter' ? `"${fontFamily}", sans-serif` : undefined }}>
                        {noteTitle || "Título de la Nota"}
                      </h3>
                      <p className="text-sm opacity-90 truncate max-w-full px-4">
                        {noteContent || "Contenido de la nota..."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800 gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold px-8 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all">
              {saveMutation.isPending ? "Guardando..." : "Guardar Diseño"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

