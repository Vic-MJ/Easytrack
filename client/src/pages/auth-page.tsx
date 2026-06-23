
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  User,
  Lock,
  Users,
  Building2,
  Shield,
  MessageSquare,
  ExternalLink,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  LogIn,
  Sparkles,
  Star,
  Zap,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [logoClicks, setLogoClicks] = useState(0);
  const [showDebuggerModal, setShowDebuggerModal] = useState(false);
  const [dbRestoreFile, setDbRestoreFile] = useState<File | null>(null);
  const [isDbRestoring, setIsDbRestoring] = useState(false);
  const [createDbFirst, setCreateDbFirst] = useState(true);

  const [newAdmin, setNewAdmin] = useState({ username: "", name: "", password: "" });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const getAreaDisplayName = (area: string) => {
    const names: Record<string, string> = {
      corte: "Corte",
      bordado: "Bordado",
      ensamble: "Ensamble",
      plancha: "Plancha/Empaque",
      calidad: "Calidad",
      envios: "Envíos",
      patronaje: "Patronaje",
      almacen: "Almacén",
      diseño: "Diseño",
      maquilas: "Maquilas",
      admin: "Administración"
    };
    return names[area] || area;
  };

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    name: "",
    area: "" as any,
    adminPassword: "",
  });

  // Redirect if user is authenticated
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  // Don't render if user exists
  if (user) {
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const newClicks = prev + 1;
      if (newClicks >= 5) {
        setShowDebuggerModal(true);
        return 0;
      }
      // Reset after 2 seconds of inactivity
      setTimeout(() => setLogoClicks(0), 2000);
      return newClicks;
    });
  };

  const handlePublicRestore = () => {
    if (!dbRestoreFile) {
      alert("Por favor selecciona un archivo");
      return;
    }
    setIsDbRestoring(true);
    const formData = new FormData();
    formData.append('backup', dbRestoreFile);
    formData.append('createDb', String(createDbFirst));

    fetch("/api/public/pg-restore-init", {
      method: "POST",
      body: formData
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Error al restaurar");
        }
        return res.json();
      })
      .then(() => {
        setIsDbRestoring(false);
        setShowDebuggerModal(false);
        setDbRestoreFile(null);
        alert('Base de datos restaurada correctamente. Refresca la página.');
        window.location.reload();
      })
      .catch((error) => {
        setIsDbRestoring(false);
        alert(`Error de Restauración BD: ${error.message}`);
      });
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.username || !newAdmin.name || !newAdmin.password) {
      alert("Por favor llena todos los campos para crear el administrador");
      return;
    }

    setIsCreatingAdmin(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newAdmin,
          area: "admin"
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al crear administrador");
      }

      alert("Administrador creado exitosamente y sesión iniciada.");
      window.location.reload();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Fondos dinámicos mejorados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradientes principales más vibrantes */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-violet-400/30 via-purple-400/25 to-fuchsia-400/30 dark:from-violet-600/40 dark:via-purple-600/30 dark:to-fuchsia-600/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-400/25 via-indigo-400/20 to-cyan-400/25 dark:from-blue-600/35 dark:via-indigo-600/25 dark:to-cyan-600/35 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-rose-400/20 via-pink-400/15 to-orange-400/20 dark:from-rose-600/30 dark:via-pink-600/20 dark:to-orange-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Partículas flotantes mejoradas */}
        <div className="absolute inset-0">
          {/* Estrellas brillantes */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`star-${i}`}
              className={`absolute animate-pulse ${i % 2 === 0 ? 'animate-ping' : 'animate-bounce'
                }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              <Star className={`w-${Math.floor(Math.random() * 3) + 2} h-${Math.floor(Math.random() * 3) + 2} text-yellow-400/60 dark:text-yellow-300/70`} />
            </div>
          ))}

          {/* Rayos de luz */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`zap-${i}`}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              <Zap className={`w-${Math.floor(Math.random() * 2) + 3} h-${Math.floor(Math.random() * 2) + 3} text-blue-400/50 dark:text-blue-300/60`} />
            </div>
          ))}

          {/* Sparkles decorativos */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute animate-spin"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              <Sparkles className={`w-${Math.floor(Math.random() * 2) + 2} h-${Math.floor(Math.random() * 2) + 2} text-purple-400/40 dark:text-purple-300/50`} />
            </div>
          ))}
        </div>

        {/* Ondas de luz animadas */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent dark:via-violet-300/60 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-400/50 to-transparent dark:via-pink-300/60 animate-pulse delay-1000"></div>
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-400/50 to-transparent dark:via-blue-300/60 animate-pulse delay-2000"></div>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent dark:via-indigo-300/60 animate-pulse delay-500"></div>
        </div>
      </div>

      {/* Contenedor principal mejorado */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Panel izquierdo mejorado */}
          <div className="hidden lg:block space-y-8">
            <div className="text-center lg:text-left">
              {/* Logo con efecto brillante */}
              <div
                onClick={handleLogoClick}
                className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-500 dark:via-purple-500 dark:to-fuchsia-500 rounded-3xl shadow-2xl mb-8 group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src="/LogoJASANA.png"
                  alt="JASANA"
                  className="relative w-18 h-16 object-contain filter brightness-0 invert group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>

              <h1 className="text-5xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent mb-4 tracking-tight">
                Bienvenido a JASANA
              </h1>
            </div>

            <div className="space-y-8">
              {/* Características mejoradas */}
              <div className="group flex items-start space-x-6 p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-violet-200/50 dark:border-violet-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-400 dark:to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    Rápido y Optimizado
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Procesa pedidos y transferencias de manera ágil y eficiente con tecnología de vanguardia.
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-6 p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Gestión Centralizada
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Controla toda la producción desde una sola plataforma integrada y moderna.
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-6 p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Colaboración en Equipo
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Trabaja de manera coordinada con todas las áreas de producción en tiempo real.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Formularios mejorado */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8 transition-all duration-300 hover:shadow-3xl">

              {/* Efecto brillante en el borde */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 via-purple-400/20 to-fuchsia-400/20 dark:from-violet-600/30 dark:via-purple-600/30 dark:to-fuchsia-600/30 rounded-3xl blur-xl -z-10"></div>

              {/* Tabs de navegación mejorados con animación layout */}
              <div className="flex space-x-1 mb-8 p-1.5 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden">
                <button
                  onClick={() => setIsRegisterMode(false)}
                  className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-colors duration-300 relative z-10 ${!isRegisterMode ? "text-white" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {!isRegisterMode && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative flex items-center justify-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Acceso</span>
                  </div>
                </button>
                <button
                  onClick={() => setIsRegisterMode(true)}
                  className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-colors duration-300 relative z-10 ${isRegisterMode ? "text-white" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {isRegisterMode && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative flex items-center justify-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Registro</span>
                  </div>
                </button>
              </div>

              {/* Logo mobile mejorado */}
              <div className="lg:hidden text-center mb-8">
                <div
                  onClick={handleLogoClick}
                  className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-500 dark:via-purple-500 dark:to-fuchsia-500 rounded-2xl shadow-2xl mb-4 group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src="/LogoJASANA.png"
                    alt="JASANA"
                    className="relative w-14 h-12 object-contain filter brightness-0 invert"
                  />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                  JASANA
                </h2>
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  Sistema de Gestión de Pedidos
                </p>
              </div>

              {/* Formularios con AnimatePresence para transiciones suaves */}
              <div className="relative min-h-[450px]">
                <AnimatePresence mode="wait">
                  {!isRegisterMode ? (
                    <motion.div
                      key="login-form"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <motion.h2 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-3xl font-bold text-slate-900 dark:text-white mb-2"
                        >
                          Bienvenido
                        </motion.h2>
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-slate-500 dark:text-slate-400"
                        >
                          Gestiona tus pedidos con eficiencia
                        </motion.p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-4">
                          <div className="group space-y-2">
                            <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                              Usuario
                            </Label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                              <Input
                                id="username"
                                type="text"
                                value={loginData.username}
                                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                                required
                                placeholder="Ingresa tu usuario"
                                className="pl-12 h-14 bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-400 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                              />
                            </div>
                          </div>

                          <div className="group space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                              Contraseña
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                              <Input
                                id="password"
                                type={showLoginPassword ? "text" : "password"}
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                required
                                placeholder="••••••••"
                                className="pl-12 pr-12 h-14 bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-400 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
                              >
                                {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center pt-2">
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors"
                          >
                            ¿Problemas para entrar? Haz clic aquí
                          </button>
                        </div>

                        <Button
                          type="submit"
                          disabled={loginMutation.isPending}
                          className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-violet-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-4"
                        >
                          {loginMutation.isPending ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <span>Entrar al Dashboard</span>
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register-form"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Crear Perfil</h2>
                        <p className="text-slate-500 dark:text-slate-400">Únete al equipo de JASANA</p>
                      </div>

                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Usuario</Label>
                            <Input
                              value={registerData.username}
                              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                              required
                              className="h-12 rounded-xl bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Nombre</Label>
                            <Input
                              value={registerData.name}
                              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                              required
                              className="h-12 rounded-xl bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Contraseña</Label>
                          <div className="relative">
                            <Input
                              type={showRegisterPassword ? "text" : "password"}
                              value={registerData.password}
                              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                              required
                              className="h-12 rounded-xl bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                              {showRegisterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Área</Label>
                          <Select
                            value={registerData.area}
                            onValueChange={(value) => setRegisterData({ ...registerData, area: value as any })}
                          >
                            <SelectTrigger className="h-12 rounded-xl bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700">
                              <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="corte">Corte ✂️</SelectItem>
                              <SelectItem value="bordado">Bordado 🪡</SelectItem>
                              <SelectItem value="ensamble">Ensamble 🔧</SelectItem>
                              <SelectItem value="plancha">Plancha/Empaque 👔</SelectItem>
                              <SelectItem value="calidad">Calidad ✅</SelectItem>
                              <SelectItem value="envios">Envíos 📦</SelectItem>
                              <SelectItem value="patronaje">Patronaje 📐</SelectItem>
                              <SelectItem value="almacen">Almacén 🏪</SelectItem>
                              <SelectItem value="diseño">Diseño 🎨</SelectItem>
                              <SelectItem value="maquilas">Maquilas 🏭</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {registerData.area && registerData.area !== "admin" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-1"
                          >
                            <Label className="text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 ml-1">
                              <Shield className="w-3 h-3" /> Seguridad
                            </Label>
                            <Input
                              type="password"
                              value={registerData.adminPassword}
                              onChange={(e) => setRegisterData({ ...registerData, adminPassword: e.target.value })}
                              required
                              placeholder="Código de autorización"
                              className="h-11 rounded-xl bg-orange-50/30 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900"
                            />
                          </motion.div>
                        )}

                        <Button
                          type="submit"
                          disabled={registerMutation.isPending}
                          className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-2"
                        >
                          {registerMutation.isPending ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <span>Completar Registro</span>
                              <UserPlus className="w-5 h-5" />
                            </div>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog mejorado */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="max-w-md rounded-3xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
              <Lock className="relative w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              ¿Olvidaste tu contraseña?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 text-center px-2">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
              Para restablecer tu contraseña, necesitas ponerte en contacto con
              el administrador del sistema.
            </p>

            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-inner">
              <div className="flex items-center justify-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-lg text-blue-700 dark:text-blue-300">
                  Contacto por Teams
                </span>
              </div>
              <p className="text-blue-600 dark:text-blue-400 leading-relaxed">
                Comunícate con el administrador a través de Microsoft Teams para
                solicitar el restablecimiento de tu contraseña.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-8 gap-4">
            <Button
              variant="outline"
              onClick={() => setShowForgotPassword(false)}
              className="flex-1 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-all duration-300"
            >
              Cerrar
            </Button>
            <Button
              onClick={() => {
                window.open(`msteams:/l/chat/0/0?users=admin`);
              }}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:via-indigo-600 dark:hover:to-purple-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Abrir Teams
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Debugger / Initial DB Restore Modal */}
      <Dialog open={showDebuggerModal} onOpenChange={setShowDebuggerModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Zap className="w-5 h-5" /> JASANA Debugger / Restore DB
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
              <strong>ADVERTENCIA:</strong> Este panel es exclusivo para administradores cuando la base de datos se ha corrompido o no existe.
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="createDb"
                checked={createDbFirst}
                onChange={(e) => setCreateDbFirst(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="createDb" className="text-sm cursor-pointer">
                Intentar crear la base de datos "jasanaordenes" primero
              </Label>
            </div>

            <div className="space-y-2 mb-6">
              <Label>Archivo de respaldo (.backup, .sql, .tar)</Label>
              <Input
                type="file"
                accept=".backup,.sql,.tar,.dump"
                onChange={(e) => setDbRestoreFile(e.target.files?.[0] || null)}
              />
              <Button
                onClick={handlePublicRestore}
                disabled={isDbRestoring || !dbRestoreFile}
                className="w-full bg-red-600 hover:bg-red-700 mt-2"
              >
                {isDbRestoring ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isDbRestoring ? "Restaurando..." : "Ejecutar Restauración"}
              </Button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <Label className="text-red-700 dark:text-red-400 font-bold mb-2 block">Crear Administrador de Emergencia</Label>
              <div className="space-y-3">
                <Input
                  placeholder="Usuario"
                  value={newAdmin.username}
                  onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })}
                />
                <Input
                  placeholder="Nombre Completo"
                  value={newAdmin.name}
                  onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={newAdmin.password}
                  onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                />
                <Button
                  onClick={handleCreateAdmin}
                  disabled={isCreatingAdmin}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {isCreatingAdmin ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Crear Administrador
                </Button>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDebuggerModal(false)} disabled={isDbRestoring || isCreatingAdmin}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
