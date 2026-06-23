import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Bell,
    LogOut,
    User,
    MessageSquare,
    ChevronDown,
    Clock,
    Flower2,
    Sprout,
    Sun,
    Star,
    Moon,
    Cloud,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useQuery } from "@tanstack/react-query";

interface TopBarProps {
    onShowNotifications: () => void;
}

export function TopBar({ onShowNotifications }: TopBarProps) {
    const { user, logoutMutation } = useAuth();
    const { theme } = useTheme();
    const [showProfile, setShowProfile] = useState(false);
    const [currentTime, setCurrentTime] = useState("");
    const [showNoteDialog, setShowNoteDialog] = useState(false);

    const [timeLeft, setTimeLeft] = useState({
        days: 0, hours: 0, minutes: 0, seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const targetDate = new Date('2025-10-12T00:00:00');
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
            setCurrentTime(timeString);
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);


    const { data: pendingTransfers = [] } = useQuery<any[]>({
        queryKey: ["/api/transfers/pending"],
        enabled: !!user,
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    const { data: repositionNotifications = [] } = useQuery({
        queryKey: ["/api/notifications"],
        enabled: !!user,
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
        queryFn: async () => {
            const res = await fetch('/api/notifications', { credentials: 'include' });
            if (!res.ok) return [];
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
                    n.type === 'completion_approval_needed'
                )
            );
        },
    });

    const getAreaDisplayName = (area: string) => {
        const names: Record<string, string> = {
            corte: "Corte", bordado: "Bordado", ensamble: "Ensamble",
            plancha: "Plancha/Empaque", calidad: "Calidad", envios: "Envíos",
            admin: "Admin", operaciones: "Operaciones", almacen: "Almacén", diseño: "Diseño"
        };
        return names[area] || area;
    };

    const getUserInitials = (name: string) => {
        if (!name) return "U";
        const words = name.trim().split(' ');
        if (words.length === 1) return words[0].charAt(0).toUpperCase();
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    const getAreaColor = (area: string) => {
        const colors: Record<string, string> = {
            corte: "bg-emerald-600 text-white", bordado: "bg-blue-600 text-white",
            ensamble: "bg-fuchsia-600 text-white", plancha: "bg-rose-600 text-white",
            calidad: "bg-indigo-600 text-white", envios: "bg-purple-600 text-white",
            admin: "bg-slate-600 text-white", operaciones: "bg-green-600 text-white",
            almacen: "bg-amber-600 text-white", diseño: "bg-violet-600 text-white"
        };
        return colors[area] || "bg-gray-500 text-white";
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return "Buenos días";
        if (hour >= 12 && hour < 19) return "Buenas tardes";
        return "Buenas noches";
    };

    const totalNotifications = pendingTransfers.length + repositionNotifications.length;

    const { data: festivitySetting } = useQuery({
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
        },
        refetchInterval: 30000,
    });

    const isFestivityActive = () => {
        if (!festivitySetting || !festivitySetting.enabled || !user) return false;
        
        const targetsUsers = festivitySetting.targetUsers || [];
        const targetsAreas = festivitySetting.targetAreas || [];
        
        if (targetsUsers.length === 0 && targetsAreas.length === 0) return false;
        
        if (targetsUsers.includes(user.id)) return true;
        if (user.area && targetsAreas.includes(user.area)) return true;
        
        return false;
    };

    const festivityActive = isFestivityActive();
    
    const festivityStyles = festivityActive ? {
        background: festivitySetting.useGradient 
            ? `linear-gradient(${festivitySetting.gradientDirection || 'to right'}, ${festivitySetting.gradientStart}, ${festivitySetting.gradientEnd})`
            : festivitySetting.backgroundColor,
        color: festivitySetting.textColor,
        fontFamily: festivitySetting.fontFamily !== 'Inter' ? `"${festivitySetting.fontFamily}", sans-serif` : undefined,
        backgroundImage: festivitySetting.backgroundImage ? `url(${festivitySetting.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    } : {};

    const baseHeaderClass = "relative h-16 border-b border-border/70 backdrop-blur-md sticky top-0 z-40 shadow-md dark:shadow-none transition-all duration-500 overflow-hidden group w-full flex items-center";
    const headerClass = festivityActive 
        ? `${baseHeaderClass} ${festivitySetting.animation && festivitySetting.animation !== 'none' && !['emoji-fall', 'emoji-rise'].includes(festivitySetting.animation) ? `animate-${festivitySetting.animation}` : ''}` 
        : `${baseHeaderClass} bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(15,23,42,0.7)]`;

    const getMessageAlignmentClass = () => {
        if (!festivityActive || !festivitySetting.messageAlignment) return "justify-center";
        switch (festivitySetting.messageAlignment) {
            case "left": return "justify-start";
            case "right": return "justify-end";
            case "center": return "justify-center";
            default: return "justify-center";
        }
    };

    // Render floating emojis
    const renderFloatingEmojis = () => {
        if (!festivityActive || !festivitySetting.floatingEmojis) return null;
        
        const emojiList = festivitySetting.floatingEmojis.split(' ').filter((e: string) => e.trim().length > 0);
        if (emojiList.length === 0) return null;
        
        const isFalling = festivitySetting.emojiAnimation === 'fall';
        
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
                {Array.from({ length: 20 }).map((_, i) => {
                    const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
                    const left = `${Math.random() * 100}%`;
                    const animationDelay = `${Math.random() * 5}s`;
                    const animationDuration = `${3 + Math.random() * 4}s`;
                    const fontSize = `${1 + Math.random() * 1}rem`;
                    
                    return (
                        <span 
                            key={i} 
                            className={`emoji-floating ${isFalling ? 'animate-[emoji-fall_linear_infinite]' : 'animate-[emoji-rise_linear_infinite]'}`}
                            style={{ 
                                left, 
                                animationDelay, 
                                animationDuration,
                                fontSize,
                                bottom: isFalling ? 'auto' : '-2rem',
                                top: isFalling ? '-2rem' : 'auto'
                            }}
                        >
                            {randomEmoji}
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <div className={headerClass} style={festivityStyles}>
                {renderFloatingEmojis()}
                {/* Decoración Temática Extendida - Solo si no hay festividad activa */}
                {!festivityActive && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60 dark:opacity-70 transition-opacity duration-700">
                        {/* Modo Claro: Primavera */}
                        <div className="absolute inset-0 dark:hidden flex justify-between items-center px-4 md:px-20">
                            <Flower2 className="text-pink-500 w-6 h-6 animate-pulse relative top-2" style={{ animationDuration: '3s' }} />
                            <Cloud className="text-sky-300/60 w-12 h-12 absolute top-0 left-[15%] animate-pulse" style={{ animationDuration: '4s' }} />
                            <Sprout className="text-green-500 w-5 h-5 animate-bounce relative -top-1" style={{ animationDuration: '2s' }} />
                            <Flower2 className="text-purple-400 w-7 h-7 animate-pulse relative top-3" style={{ animationDuration: '2.5s' }} />
                            <Sun className="text-yellow-400 w-20 h-20 absolute left-[35%] -top-6 animate-[spin_12s_linear_infinite] opacity-60" />
                            <Flower2 className="text-rose-400 w-6 h-6 animate-pulse relative -top-2" style={{ animationDuration: '3.5s' }} />
                            <Sprout className="text-green-400 w-6 h-6 animate-bounce relative top-1" style={{ animationDuration: '2.2s' }} />
                            <Cloud className="text-sky-300/60 w-16 h-16 absolute right-[20%] -top-2 animate-pulse" style={{ animationDuration: '5s' }} />
                            <Flower2 className="text-pink-400 w-8 h-8 animate-pulse relative top-2" style={{ animationDuration: '2.8s' }} />
                        </div>
                        {/* Modo Oscuro: Noche Estrellada y Luna */}
                        <div className="absolute inset-0 hidden dark:flex justify-between items-center px-4 md:px-20 bg-slate-900/30">
                            <Star className="text-yellow-200 w-4 h-4 animate-pulse relative top-[-10px]" style={{ animationDuration: '2s' }} />
                            <Star className="text-sky-100 w-3 h-3 animate-pulse relative top-[15px]" style={{ animationDuration: '3s' }} />
                            <Moon className="text-slate-200 fill-slate-100/20 w-16 h-16 absolute left-[25%] -top-3 animate-pulse opacity-80" style={{ animationDuration: '4s' }} />
                            <Star className="text-yellow-200 w-5 h-5 animate-pulse relative top-[-5px]" style={{ animationDuration: '2.5s' }} />
                            <Star className="text-white w-2 h-2 animate-pulse relative top-[5px]" style={{ animationDuration: '1.5s' }} />
                            <Star className="text-blue-100 w-4 h-4 animate-pulse relative top-[-15px]" style={{ animationDuration: '3.5s' }} />
                            <Star className="text-yellow-200 w-3 h-3 animate-pulse relative top-[10px]" style={{ animationDuration: '2.2s' }} />
                            <Star className="text-white w-4 h-4 animate-pulse relative top-[-8px]" style={{ animationDuration: '2.8s' }} />
                        </div>
                    </div>
                )}

                <div className="relative z-30 flex h-full items-center justify-between px-8 w-full">

                    {/* Left Section: User info / Default greeting */}
                    <div className="flex flex-col leading-snug flex-1 shrink-0">
                        {(!festivityActive || !festivitySetting.message) && (
                            <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight text-foreground flex items-center whitespace-nowrap">
                                {getGreeting()},
                                <span className="text-primary/80 ml-2">{user?.name.split(' ')[0]}</span>
                            </h2>
                        )}
                        {user?.area && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-medium text-muted-foreground" style={festivityActive ? { color: festivitySetting.textColor, opacity: 0.8 } : {}}>
                                    Área de trabajo:
                                </span>
                                <Badge
                                    className={`text-xs px-2 py-0.5 font-semibold uppercase ${getAreaColor(user.area)}`}
                                >
                                    {getAreaDisplayName(user.area)}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Center Section: Festivity Message & Note */}
                    {festivityActive && festivitySetting.message && (
                        <div className={`flex-1 flex items-center px-4 z-40 pointer-events-auto ${getMessageAlignmentClass()}`}>
                            <h2 
                                className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center drop-shadow-md gap-4 whitespace-nowrap" 
                                style={{ color: festivitySetting.useMulticolorText ? undefined : festivitySetting.textColor }}
                            >
                                <div className="flex">
                                    {festivitySetting.useMulticolorText ? (
                                        festivitySetting.message.split('').map((char: string, i: number) => (
                                            <span key={i} style={{ color: char.trim() ? (festivitySetting.customLetterColors?.[i] || ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'][i % 8]) : undefined }}>
                                                {char === ' ' ? '\u00A0' : char}
                                            </span>
                                        ))
                                    ) : (
                                        festivitySetting.message
                                    )}
                                </div>
                                {festivitySetting.noteEnabled && (
                                    <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="h-8 rounded-full font-sans text-xs bg-white/20 hover:bg-white/40 border border-white/30 backdrop-blur-sm shadow-lg transition-all cursor-pointer relative z-50 pointer-events-auto"
                                        onClick={() => setShowNoteDialog(true)}
                                        style={{ color: festivitySetting.textColor }}
                                    >
                                        {festivitySetting.noteButtonText || "Ver Sorpresa"}
                                    </Button>
                                )}
                            </h2>
                        </div>
                    )}

                    {/* Clock (Only visible if no festivity to avoid overlap) */}
                    {(!festivityActive || !festivitySetting.message) && (
                        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
                            <div className="font-mono text-xl font-bold tracking-widest px-4 py-1 rounded-lg shadow-sm backdrop-blur-sm text-primary bg-muted/40">
                                {currentTime}
                            </div>
                        </div>
                    )}

                    {/* Right Section: Notifications and User Menu */}
                    <div className="flex items-center gap-3 h-full flex-1 justify-end shrink-0 pointer-events-auto z-40">

                        {timeLeft.days > 0 && (!festivityActive) && (
                            <div className="hidden lg:flex items-center gap-2 text-sm text-primary/70 font-medium bg-muted/50 rounded-lg px-3 py-1">
                                <Clock className="w-4 h-4" />
                                <span className="font-mono">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</span>
                            </div>
                        )}

                        <div className="flex items-center gap-1 border-r pr-2 border-border/70">
                            <ThemeToggle />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onShowNotifications}
                                className={`relative h-10 w-10 rounded-full transition-colors ${festivityActive ? 'hover:bg-white/20 text-current' : 'hover:bg-muted'}`}
                                title="Notificaciones Pendientes"
                                style={festivityActive ? { color: festivitySetting.textColor } : {}}
                            >
                                <Bell className={`h-5 w-5 ${festivityActive ? '' : 'text-foreground/80'}`} />
                                {totalNotifications > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center min-w-5 border-2 border-background shadow-lg animate-pulse"
                                    >
                                        {totalNotifications > 99 ? '99+' : totalNotifications}
                                    </Badge>
                                )}
                            </Button>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={`flex items-center gap-2 h-10 pl-1 pr-3 rounded-full transition-colors ${festivityActive ? 'hover:bg-white/20 text-current' : 'hover:bg-muted'}`}
                                    title={`Menú de Usuario: ${user?.name || "Usuario"}`}
                                    style={festivityActive ? { color: festivitySetting.textColor } : {}}
                                >
                                    <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary transition-colors">
                                        <AvatarImage src="" alt={user?.name || ""} />
                                        <AvatarFallback
                                            className={`font-bold text-base ${getAreaColor(user?.area || '')}`}
                                        >
                                            {getUserInitials(user?.name || "")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className={`hidden sm:inline text-sm font-semibold ${festivityActive ? '' : 'text-foreground/90'}`}>
                                        {user?.name.split(' ')[0]}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${festivityActive ? 'opacity-80' : 'text-muted-foreground'}`} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src="" alt={user?.name || ""} />
                                            <AvatarFallback
                                                className={`font-bold text-base ${getAreaColor(user?.area || '')}`}
                                            >
                                                {getUserInitials(user?.name || "")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col space-y-0.5">
                                            <p className="text-base font-bold leading-none">{user?.name}</p>
                                            <p className="text-sm leading-none text-muted-foreground">@{user?.username}</p>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="font-medium">
                                    <Badge
                                        className={`text-xs px-2 py-0.5 ${getAreaColor(user?.area || '')}`}
                                    >
                                        Área: {user?.area ? getAreaDisplayName(user.area) : 'Sin asignar'}
                                    </Badge>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem onClick={() => setShowProfile(true)} className="cursor-pointer">
                                    <User className="mr-3 h-4 w-4 text-primary/80" />
                                    <span>Mi Perfil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href={`msteams:/l/chat/0/0?users=${user?.username}`} target="_blank" rel="noopener noreferrer" className="flex w-full cursor-pointer">
                                        <MessageSquare className="mr-3 h-4 w-4 text-primary/80" />
                                        <span>Chatear en Teams</span>
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => logoutMutation.mutate()}
                                    disabled={logoutMutation.isPending}
                                    className="text-red-600 focus:text-white focus:bg-red-600/90 cursor-pointer font-medium"
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    <span>Cerrar Sesión</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <Dialog open={showProfile} onOpenChange={setShowProfile}>
                <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-white/20">

                    <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    <div className="px-6 pb-6 relative">
                        <div className="relative -mt-16 mb-4 flex justify-center">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-pink-500 to-violet-500 rounded-full blur opacity-75 animate-pulse" />
                                <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-900 shadow-xl relative">
                                    <AvatarImage src="" alt={user?.name || ""} />
                                    <AvatarFallback className={`font-bold text-3xl text-white shadow-inner ${getAreaColor(user?.area || '')}`}>
                                        {getUserInitials(user?.name || "")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white dark:border-slate-900 rounded-full" title="En línea"></div>
                            </div>
                        </div>

                        <div className="text-center space-y-1 mb-6">
                            <h3 className="text-2xl font-bold text-foreground tracking-tight">{user?.name}</h3>
                            <p className="text-sm font-medium text-muted-foreground/80">@{user?.username}</p>
                            <div className="pt-2">
                                <Badge className={`px-3 py-1 text-xs font-bold tracking-wide shadow-sm ${getAreaColor(user?.area || '')}`}>
                                    {user?.area ? getAreaDisplayName(user.area).toUpperCase() : 'SIN ÁREA'}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="p-3 bg-slate-100/80 dark:bg-slate-800/50 rounded-xl border border-border/60 shadow-sm flex flex-col items-center justify-center gap-1 group transition-all hover:bg-white dark:hover:bg-slate-800/80">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="font-bold text-foreground group-hover:text-emerald-600 transition-colors">Activo</span>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-100/80 dark:bg-slate-800/50 rounded-xl border border-border/60 shadow-sm flex flex-col items-center justify-center gap-1 group transition-all hover:bg-white dark:hover:bg-slate-800/80">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rol</span>
                                <span className="font-bold text-foreground capitalize group-hover:text-primary transition-colors">Empleado</span>
                            </div>
                        </div>

                        <div className="space-y-3 bg-slate-50/80 dark:bg-slate-900/50 p-4 rounded-xl border border-border/50 mb-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground font-medium">Último acceso</span>
                                <span className="font-semibold text-foreground">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="h-px bg-border/50" />
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground font-medium">ID de Usuario</span>
                                <span className="font-semibold text-foreground">#{user?.id || '—'}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <a
                                href={`msteams:/l/chat/0/0?users=${user?.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full"
                            >
                                <Button className="w-full bg-[#505a74] hover:bg-[#3f475e] text-white shadow-lg shadow-slate-900/20 font-semibold h-11">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Contactar en Teams
                                </Button>
                            </a>

                            <Button
                                variant="outline"
                                className="w-full border-dashed border-border hover:border-primary/50 hover:bg-primary/5 h-11 font-medium"
                                onClick={() => {
                                    navigator.clipboard.writeText(`${user?.username}@uniformesjasana.com`);
                                }}
                            >
                                Copiar Correo Electrónico
                            </Button>
                        </div>

                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                <DialogContent 
                    className="sm:max-w-lg md:max-w-2xl overflow-hidden border-0 p-0 shadow-2xl rounded-2xl bg-transparent"
                    overlayClassName="bg-transparent"
                >
                    {/* Capa de Fondo con Opacidad */}
                    <div 
                        className="absolute inset-0 z-0 transition-all duration-500"
                        style={{
                            background: festivitySetting?.noteUseGradient 
                                ? `linear-gradient(${festivitySetting.noteGradientDirection || 'to right'}, ${festivitySetting.noteGradientStart}, ${festivitySetting.noteGradientEnd})`
                                : (festivitySetting?.noteBackgroundColor || '#ffffff'),
                            opacity: (festivitySetting?.noteOpacity !== undefined ? festivitySetting.noteOpacity : 100) / 100,
                        }}
                    />

                    {/* Capa de Contenido (Texto e Imágenes) */}
                    <div className="w-full h-full relative z-10 min-h-[300px] flex flex-col items-center justify-center p-6 md:p-10">
                        <div className="relative w-full flex flex-col items-center justify-center p-4 md:p-8">

                            <DialogHeader className="mb-6 w-full">
                                <DialogTitle 
                                    className="text-3xl md:text-4xl font-black text-center drop-shadow-sm w-full" 
                                    style={{ 
                                        color: festivitySetting?.noteTextColor || '#333333', 
                                        fontFamily: festivitySetting?.fontFamily && festivitySetting?.fontFamily !== 'Inter' ? `"${festivitySetting.fontFamily}", sans-serif` : undefined 
                                    }}
                                >
                                    {festivitySetting?.noteTitle || "Mensaje Especial"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="text-center w-full max-w-lg mx-auto flex flex-col items-center gap-6">
                                <p 
                                    className="text-lg md:text-2xl leading-relaxed whitespace-pre-wrap font-medium"
                                    style={{ color: festivitySetting?.noteTextColor || '#333333' }}
                                >
                                    {festivitySetting?.noteContent}
                                </p>

                                {festivitySetting?.noteBackgroundImage && (
                                    <div className="w-full mt-4 overflow-hidden rounded-2xl transition-transform duration-300 flex items-center justify-center min-h-[100px]">


                                        <img 
                                            src={festivitySetting.noteBackgroundImage} 
                                            alt="Imagen adjunta" 
                                            className="w-full h-auto max-h-[500px] object-contain block"
                                            onError={(e) => {
                                                // Si falla la carga, ocultamos el contenedor o mostramos un error sutil
                                                (e.target as HTMLImageElement).parentElement?.classList.add('hidden');
                                                console.error("Error al cargar la imagen de la nota festiva");
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}