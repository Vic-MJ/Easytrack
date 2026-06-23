import { useState, useEffect } from "react";
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
import { Paintbrush, Type, Bell, Users as UsersIcon, Sparkles } from "lucide-react";

interface FestivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: any[];
  currentConfig: any;
}

export function FestivityModal({ open, onOpenChange, users, currentConfig }: FestivityModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [messageAlignment, setMessageAlignment] = useState("center");
  
  const [useGradient, setUseGradient] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#d32f2f");
  const [gradientStart, setGradientStart] = useState("#ff416c");
  const [gradientEnd, setGradientEnd] = useState("#ff4b2b");
  const [gradientDirection, setGradientDirection] = useState("to right");
  
  const [textColor, setTextColor] = useState("#ffffff");
  const [useMulticolorText, setUseMulticolorText] = useState(false);
  const [customLetterColors, setCustomLetterColors] = useState<string[]>([]);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [animation, setAnimation] = useState("none");
  
  const [floatingEmojis, setFloatingEmojis] = useState("");
  const [emojiAnimation, setEmojiAnimation] = useState("fall");

  const [noteEnabled, setNoteEnabled] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteButtonText, setNoteButtonText] = useState("Ver Sorpresa");
  const [noteBackgroundColor, setNoteBackgroundColor] = useState("#ffffff");
  const [noteUseGradient, setNoteUseGradient] = useState(false);
  const [noteGradientStart, setNoteGradientStart] = useState("#ff416c");
  const [noteGradientEnd, setNoteGradientEnd] = useState("#ff4b2b");
  const [noteGradientDirection, setNoteGradientDirection] = useState("to right");
  const [noteOpacity, setNoteOpacity] = useState(100);
  const [noteTextColor, setNoteTextColor] = useState("#333333");
  const [noteBackgroundImage, setNoteBackgroundImage] = useState("");

  const [targetUsers, setTargetUsers] = useState<number[]>([]);
  const [targetAreas, setTargetAreas] = useState<string[]>([]);

  useEffect(() => {
    if (currentConfig) {
      setEnabled(currentConfig.enabled || false);
      setMessage(currentConfig.message || "");
      setMessageAlignment(currentConfig.messageAlignment || "center");
      
      setUseGradient(currentConfig.useGradient || false);
      setBackgroundColor(currentConfig.backgroundColor || "#d32f2f");
      setGradientStart(currentConfig.gradientStart || "#ff416c");
      setGradientEnd(currentConfig.gradientEnd || "#ff4b2b");
      setGradientDirection(currentConfig.gradientDirection || "to right");
      
      setTextColor(currentConfig.textColor || "#ffffff");
      setUseMulticolorText(currentConfig.useMulticolorText || false);
      setCustomLetterColors(currentConfig.customLetterColors || []);
      setFontFamily(currentConfig.fontFamily || "Inter");
      setBackgroundImage(currentConfig.backgroundImage || "");
      setAnimation(currentConfig.animation || "none");
      
      setFloatingEmojis(currentConfig.floatingEmojis || "");
      setEmojiAnimation(currentConfig.emojiAnimation || "fall");
      
      setNoteEnabled(currentConfig.noteEnabled || false);
      setNoteTitle(currentConfig.noteTitle || "");
      setNoteContent(currentConfig.noteContent || "");
      setNoteButtonText(currentConfig.noteButtonText || "Ver Sorpresa");
      setNoteBackgroundColor(currentConfig.noteBackgroundColor || "#ffffff");
      setNoteUseGradient(currentConfig.noteUseGradient || false);
      setNoteGradientStart(currentConfig.noteGradientStart || "#ff416c");
      setNoteGradientEnd(currentConfig.noteGradientEnd || "#ff4b2b");
      setNoteGradientDirection(currentConfig.noteGradientDirection || "to right");
      setNoteOpacity(currentConfig.noteOpacity !== undefined ? currentConfig.noteOpacity : 100);
      setNoteTextColor(currentConfig.noteTextColor || "#333333");
      setNoteBackgroundImage(currentConfig.noteBackgroundImage || "");

      setTargetUsers(currentConfig.targetUsers || []);
      setTargetAreas(currentConfig.targetAreas || []);
    }
  }, [currentConfig, open]);

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
      toast({ title: "Configuración guardada exitosamente" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo guardar la configuración", variant: "destructive" });
    }
  });

  const uploadImageMutation = useMutation({
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
      toast({ title: "Imagen subida exitosamente" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo subir la imagen", variant: "destructive" });
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadImageMutation.mutate(e.target.files[0]);
    }
  };

  const handleSave = () => {
    saveMutation.mutate({
      enabled,
      message,
      messageAlignment,
      useGradient,
      backgroundColor,
      gradientStart,
      gradientEnd,
      gradientDirection,
      textColor,
      useMulticolorText,
      customLetterColors,
      fontFamily,
      backgroundImage,
      animation,
      floatingEmojis,
      emojiAnimation,
      noteEnabled,
      noteTitle,
      noteContent,
      noteButtonText,
      noteBackgroundColor,
      noteUseGradient,
      noteGradientStart,
      noteGradientEnd,
      noteGradientDirection,
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
    if (backgroundImage) return { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    if (useGradient) return { background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})` };
    return { backgroundColor };
  };

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
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="text-xs">Color 1</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={gradientStart} onChange={e => setGradientStart(e.target.value)} className="w-12 p-1 h-8" />
                            <Input type="text" value={gradientStart} onChange={e => setGradientStart(e.target.value)} className="h-8 text-xs" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Color 2</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={gradientEnd} onChange={e => setGradientEnd(e.target.value)} className="w-12 p-1 h-8" />
                            <Input type="text" value={gradientEnd} onChange={e => setGradientEnd(e.target.value)} className="h-8 text-xs" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Dirección del Degradado</Label>
                        <Select value={gradientDirection} onValueChange={setGradientDirection}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="to right">Hacia la Derecha →</SelectItem>
                            <SelectItem value="to left">Hacia la Izquierda ←</SelectItem>
                            <SelectItem value="to bottom">Hacia Abajo ↓</SelectItem>
                            <SelectItem value="to bottom right">Diagonal Inferior Derecha ↘</SelectItem>
                          </SelectContent>
                        </Select>
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
                    <Label>URL Imagen de Fondo (Prioridad sobre colores)</Label>
                    <Input value={backgroundImage} onChange={e => setBackgroundImage(e.target.value)} placeholder="Ej: https://.../fondo.jpg" />
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
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs">Color Inicio</Label>
                              <div className="flex gap-2">
                                <Input type="color" value={noteGradientStart} onChange={e => setNoteGradientStart(e.target.value)} className="w-12 p-1 h-8" />
                                <Input type="text" value={noteGradientStart} onChange={e => setNoteGradientStart(e.target.value)} className="h-8 text-xs flex-1" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Color Fin</Label>
                              <div className="flex gap-2">
                                <Input type="color" value={noteGradientEnd} onChange={e => setNoteGradientEnd(e.target.value)} className="w-12 p-1 h-8" />
                                <Input type="text" value={noteGradientEnd} onChange={e => setNoteGradientEnd(e.target.value)} className="h-8 text-xs flex-1" />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Dirección del Degradado</Label>
                            <Select value={noteGradientDirection} onValueChange={setNoteGradientDirection}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="to right">Hacia la Derecha →</SelectItem>
                                <SelectItem value="to left">Hacia la Izquierda ←</SelectItem>
                                <SelectItem value="to bottom">Hacia Abajo ↓</SelectItem>
                                <SelectItem value="to bottom right">Diagonal Inferior Derecha ↘</SelectItem>
                              </SelectContent>
                            </Select>
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
                            onChange={handleImageUpload} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadImageMutation.isPending}
                          />
                          <Button variant="secondary" className="pointer-events-none whitespace-nowrap">
                            {uploadImageMutation.isPending ? "Subiendo..." : "Subir Imagen"}
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
                  className={`h-16 flex items-center px-4 rounded-xl shadow-inner border overflow-hidden relative ${animation !== 'none' && !['emoji-fall', 'emoji-rise'].includes(animation) ? `animate-${animation}` : ''}`}
                  style={{
                    ...getBackgroundStyle(),
                    justifyContent: messageAlignment === 'left' ? 'flex-start' : messageAlignment === 'right' ? 'flex-end' : 'center'
                  }}
                >
                  <h2 className="text-2xl font-extrabold tracking-tight drop-shadow-md z-10 flex items-center gap-4 whitespace-nowrap" style={{ color: useMulticolorText ? undefined : textColor, fontFamily: fontFamily !== 'Inter' ? `"${fontFamily}", sans-serif` : undefined }}>
                    <div className="flex">
                      {useMulticolorText ? (
                        (message || "Vista Previa").split('').map((char, i) => (
                          <span key={i} style={{ color: char.trim() ? (customLetterColors[i] || ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'][i % 8]) : undefined }}>
                            {char === ' ' ? '\u00A0' : char}
                          </span>
                        ))
                      ) : (
                        message || "Vista Previa"
                      )}
                    </div>
                    {noteEnabled && (
                      <Button size="sm" variant="secondary" className="h-7 text-xs font-sans rounded-full opacity-80 pointer-events-none shadow-md">
                        {noteButtonText}
                      </Button>
                    )}
                  </h2>
                </div>
              </div>

              {noteEnabled && (
                <div className="space-y-2">
                  <Label className="text-[10px] text-slate-400 uppercase">Nota Interactiva</Label>
                  <div className="relative rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[150px]">
                    <div 
                      className="absolute inset-0 z-0"
                      style={{
                        background: noteUseGradient 
                          ? `linear-gradient(${noteGradientDirection}, ${noteGradientStart}, ${noteGradientEnd})`
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
