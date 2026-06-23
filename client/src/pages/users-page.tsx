import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, Edit2, Trash2, UserPlus, RotateCcw, ArrowDownAZ, ArrowUpZA, ArrowLeft, Loader2, Download, Upload, UserCheck, UserX } from "lucide-react";
import Swal from 'sweetalert2';
import { Card, CardContent } from "@/components/ui/card";

// Define User type locally
type User = {
    id: number;
    username: string;
    name: string;
    area: "patronaje" | "corte" | "bordado" | "ensamble" | "plancha" | "calidad" | "operaciones" | "admin" | "almacen" | "diseño" | "maquilas";
    createdAt: Date;
    password: string;
    isActive: boolean;
};

export default function UsersPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [showResetModal, setShowResetModal] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({ name: "", username: "", area: "", newPassword: "" });
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ name: "", username: "", area: "", password: "" });
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Backup/Restore state
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [showRestoreModal, setShowRestoreModal] = useState(false);

    // Redirect if not admin
    if (user?.area !== 'admin') {
        window.location.href = '/dashboard';
        return null;
    }

    // Queries
    const { data: users = [] } = useQuery<User[]>({
        queryKey: ["/api/admin/users"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/admin/users");
            return await res.json();
        }
    });

    // Mutations
    const resetPasswordMutation = useMutation({
        mutationFn: async ({ userId, password }: { userId: number; password: string }) => {
            const res = await apiRequest("POST", "/api/admin/reset-password", {
                userId,
                newPassword: password
            });
            return await res.json();
        },
        onSuccess: () => {
            toast({
                title: "Contraseña restablecida",
                description: "La contraseña ha sido restablecida exitosamente",
            });
            setShowResetModal(false);
            setNewPassword("");
            setSelectedUser(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Error al restablecer contraseña",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: async (data: any) => {
            const { id, ...updateData } = data;
            const res = await apiRequest("PUT", `/api/admin/users/${id}`, updateData);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error al actualizar usuario");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Usuario actualizado correctamente" });
            setShowEditModal(false);
            setEditUser(null);
            setEditForm({ name: "", username: "", area: "", newPassword: "" });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Error al actualizar usuario",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const createUserMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/admin/users", data);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error al crear usuario");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Usuario creado correctamente" });
            setShowCreateModal(false);
            setCreateForm({ name: "", username: "", area: "", password: "" });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Error al crear usuario",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await apiRequest("DELETE", `/api/admin/users/${id}`);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Usuario eliminado correctamente" });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        },
        onError: err => toast({ title: "Error al eliminar usuario", description: err.message, variant: "destructive" })
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
            const res = await apiRequest("PUT", `/api/admin/users/${id}`, { isActive });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error al actualizar estado");
            }
            return res.json();
        },
        onSuccess: (_, variables) => {
            toast({
                title: variables.isActive ? "Usuario activado" : "Usuario desactivado",
                description: `El usuario ha sido ${variables.isActive ? 'activado' : 'desactivado'} correctamente.`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Error al cambiar estado",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const backupUsersMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("GET", "/api/admin/backup-users");
            return res.blob();
        },
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup-usuarios-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast({
                title: "Respaldo completado",
                description: "El respaldo de usuarios ha sido descargado exitosamente",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error al generar respaldo",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const restoreUsersMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('backup', file);
            const res = await fetch('/api/admin/restore-users', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Error al restaurar usuarios');
            }
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Restauración completada",
                description: "Los usuarios han sido restaurados exitosamente",
            });
            setShowRestoreModal(false);
            setRestoreFile(null);
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Error al restaurar usuarios",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    // Handlers
    const openEditModal = (u: User) => {
        setEditUser(u);
        setEditForm({ name: u.name, username: u.username, area: u.area, newPassword: "" });
        setShowEditModal(true);
    };

    const handleResetPassword = () => {
        if (!selectedUser || !newPassword) return;
        resetPasswordMutation.mutate({ userId: selectedUser.id, password: newPassword });
    };

    const handleSaveEdit = () => {
        if (!editUser) return;
        if (!editForm.name.trim() || !editForm.username.trim() || !editForm.area) {
            toast({
                title: "Error de validación",
                description: "Todos los campos son requeridos",
                variant: "destructive"
            });
            return;
        }
        const payload: any = {
            name: editForm.name.trim(),
            username: editForm.username.trim(),
            area: editForm.area
        };
        if (editForm.newPassword && editForm.newPassword.trim()) {
            payload.newPassword = editForm.newPassword.trim();
        }
        updateUserMutation.mutate({ id: editUser.id, ...payload });
    };

    const handleCreateUser = () => {
        if (!createForm.name.trim() || !createForm.username.trim() || !createForm.area || !createForm.password.trim()) {
            toast({
                title: "Error de validación",
                description: "Todos los campos son requeridos",
                variant: "destructive"
            });
            return;
        }
        createUserMutation.mutate({
            name: createForm.name.trim(),
            username: createForm.username.trim(),
            area: createForm.area,
            password: createForm.password.trim()
        });
    };

    const handleRestoreUsers = () => {
        if (!restoreFile) {
            toast({
                title: "Error",
                description: "Por favor selecciona un archivo de respaldo",
                variant: "destructive"
            });
            return;
        }
        restoreUsersMutation.mutate(restoreFile);
    };

    // Helpers
    const getAreaDisplayName = (area: string) => {
        const names: Record<string, string> = {
            corte: 'Corte',
            bordado: 'Bordado',
            ensamble: 'Ensamble',
            plancha: 'Plancha/Empaque',
            calidad: 'Calidad',
            envios: 'Envíos',
            almacen: 'Almacén',
            admin: 'Admin',
            diseño: 'Diseño',
            patronaje: 'Patronaje',
            operaciones: 'Operaciones',
            maquilas: 'Maquilas'
        };
        return names[area] || area;
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-slate-200 dark:border-slate-800"
                            onClick={() => window.location.href = '/admin'}
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                                <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                Gestión de Usuarios
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">Administra cuentas, roles y accesos del sistema</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => backupUsersMutation.mutate()}
                            disabled={backupUsersMutation.isPending}
                            className="gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
                        >
                            {backupUsersMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            <span className="hidden sm:inline">Respaldar</span>
                        </Button>

                        <Dialog open={showRestoreModal} onOpenChange={setShowRestoreModal}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 border-slate-200 dark:border-slate-800">
                                    <Upload className="w-4 h-4" />
                                    <span className="hidden sm:inline">Restaurar</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Restaurar Usuarios</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <p className="text-sm text-muted-foreground">
                                        Selecciona un archivo JSON de respaldo para restaurar los usuarios.
                                        <br />
                                        <span className="text-amber-500 font-bold">Nota:</span> Esto podría sobrescribir usuarios existentes.
                                    </p>
                                    <Input
                                        type="file"
                                        accept=".json"
                                        onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                                    />
                                    <Button
                                        onClick={handleRestoreUsers}
                                        disabled={!restoreFile || restoreUsersMutation.isPending}
                                        className="w-full bg-slate-900 text-white"
                                    >
                                        {restoreUsersMutation.isPending ? 'Restaurando...' : 'Confirmar Restauración'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            {users.length}
                        </span>
                        usuarios registrados
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="border-dashed border-slate-300 dark:border-slate-700 text-slate-600"
                        >
                            {sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4 mr-2" /> : <ArrowUpZA className="h-4 w-4 mr-2" />}
                            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                        </Button>

                        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                            <DialogTrigger asChild>
                                <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Nuevo Usuario
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-2xl rounded-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                        Nuevo Usuario
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-5 py-4">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label className="text-slate-600 dark:text-slate-400 font-medium text-xs uppercase tracking-wide">Nombre</Label>
                                            <Input
                                                value={createForm.name}
                                                onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                                                placeholder="Juan Pérez"
                                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-slate-900/20 rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-600 dark:text-slate-400 font-medium text-xs uppercase tracking-wide">Usuario</Label>
                                            <Input
                                                value={createForm.username}
                                                onChange={e => setCreateForm({ ...createForm, username: e.target.value })}
                                                placeholder="jperez"
                                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-slate-900/20 rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-600 dark:text-slate-400 font-medium text-xs uppercase tracking-wide">Área</Label>
                                        <Select value={createForm.area} onValueChange={val => setCreateForm({ ...createForm, area: val })}>
                                            <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
                                                <SelectValue placeholder="Seleccionar..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["admin", "corte", "bordado", "ensamble", "plancha", "calidad", "envios", "diseño", "patronaje", "almacen", "operaciones"].map(a => (
                                                    <SelectItem key={a} value={a}>{getAreaDisplayName(a)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-600 dark:text-slate-400 font-medium text-xs uppercase tracking-wide">Contraseña</Label>
                                        <Input
                                            type="password"
                                            value={createForm.password}
                                            onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-slate-900/20 rounded-lg"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-900">
                                            Cancelar
                                        </Button>
                                        <Button onClick={handleCreateUser} disabled={createUserMutation.isPending} className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 rounded-lg px-6">
                                            {createUserMutation.isPending ? "Guardando..." : "Guardar Usuario"}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* User Gird */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                    {users.length > 0 ? (
                        users
                            .sort((a, b) => sortOrder === 'asc'
                                ? a.username.localeCompare(b.username)
                                : b.username.localeCompare(a.username)
                            )
                            .map((u) => (
                                <div
                                    key={u.id}
                                    className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col"
                                >
                                    {/* Header Background */}
                                    <div className={`h-24 w-full bg-gradient-to-r ${u.area === 'admin' ? 'from-slate-700 to-slate-900' :
                                            u.area === 'corte' ? 'from-blue-500 to-cyan-500' :
                                                u.area === 'bordado' ? 'from-pink-500 to-rose-500' :
                                                    u.area === 'ensamble' ? 'from-purple-500 to-violet-500' :
                                                        u.area === 'plancha' ? 'from-orange-500 to-amber-500' :
                                                            u.area === 'calidad' ? 'from-emerald-500 to-green-500' :
                                                                u.area === 'operaciones' ? 'from-indigo-500 to-blue-500' :
                                                                    u.area === 'almacen' ? 'from-teal-500 to-emerald-500' :
                                                                        u.area === 'diseño' ? 'from-fuchsia-500 to-purple-500' :
                                                                            u.area === 'patronaje' ? 'from-sky-500 to-indigo-500' :
                                                                                u.area === 'maquilas' ? 'from-red-500 to-orange-500' :
                                                                                    'from-slate-400 to-slate-600'
                                        }`} />

                                    {/* Avatar & Info */}
                                    <div className="px-6 relative flex-grow">
                                        <div className="absolute -top-10 left-6">
                                            <div className={`
                             w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white dark:border-slate-900
                             bg-gradient-to-br ${u.area === 'admin' ? 'from-slate-700 to-slate-900' :
                                                    u.area === 'corte' ? 'from-blue-500 to-cyan-500' :
                                                        u.area === 'bordado' ? 'from-pink-500 to-rose-500' :
                                                            u.area === 'ensamble' ? 'from-purple-500 to-violet-500' :
                                                                u.area === 'plancha' ? 'from-orange-500 to-amber-500' :
                                                                    u.area === 'calidad' ? 'from-emerald-500 to-green-500' :
                                                                        u.area === 'operaciones' ? 'from-indigo-500 to-blue-500' :
                                                                            u.area === 'almacen' ? 'from-teal-500 to-emerald-500' :
                                                                                u.area === 'diseño' ? 'from-fuchsia-500 to-purple-500' :
                                                                                    u.area === 'patronaje' ? 'from-sky-500 to-indigo-500' :
                                                                                        u.area === 'maquilas' ? 'from-red-500 to-orange-500' :
                                                                                            'from-slate-400 to-slate-500'
                                                }
                           `}>
                                                {u.username.substring(0, 2).toUpperCase()}
                                            </div>
                                        </div>

                                        <div className="pt-12 pb-4 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`font-bold text-lg truncate pr-2 ${!u.isActive ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'}`} title={u.username}>
                                                        {u.username}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate" title={u.name}>
                                                        {u.name || 'Sin nombre'}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge variant="secondary" className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 border ${u.area === 'admin' ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700'}`}>
                                                        {getAreaDisplayName(u.area)}
                                                    </Badge>
                                                    <Badge className={`text-[10px] px-2 py-0 border-none ${u.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                        {u.isActive ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 font-mono">ID: #{u.id}</p>
                                        </div>
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-2">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openEditModal(u)}
                                                className="h-9 w-9 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                                                title="Editar Usuario"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => { setSelectedUser(u); setShowResetModal(true); }}
                                                className="h-9 w-9 p-0 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors"
                                                title="Restablecer Contraseña"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: u.isActive ? '¿Desactivar usuario?' : '¿Activar usuario?',
                                                        text: `El usuario ${u.username} ${u.isActive ? 'no podrá iniciar sesión' : 'podrá volver a entrar al sistema'}.`,
                                                        icon: u.isActive ? 'warning' : 'info',
                                                        showCancelButton: true,
                                                        confirmButtonColor: u.isActive ? '#e11d48' : '#059669',
                                                        cancelButtonColor: '#94a3b8',
                                                        confirmButtonText: u.isActive ? 'Desactivar' : 'Activar',
                                                        cancelButtonText: 'Cancelar',
                                                        background: '#fff',
                                                        customClass: {
                                                            popup: 'rounded-2xl shadow-xl border border-slate-100',
                                                            confirmButton: 'text-white rounded-lg px-4 py-2',
                                                            cancelButton: 'bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg px-4 py-2'
                                                        }
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            toggleStatusMutation.mutate({ id: u.id, isActive: !u.isActive });
                                                        }
                                                    })
                                                }}
                                                className={`h-9 w-9 p-0 rounded-xl transition-colors ${u.isActive
                                                        ? 'text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                        : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20'
                                                    }`}
                                                title={u.isActive ? "Desactivar Usuario" : "Activar Usuario"}
                                            >
                                                {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                            </Button>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                Swal.fire({
                                                    title: 'Confirmar eliminación',
                                                    text: `¿Deseas eliminar al usuario ${u.username}?`,
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#0f172a',
                                                    cancelButtonColor: '#94a3b8',
                                                    confirmButtonText: 'Eliminar',
                                                    cancelButtonText: 'Cancelar',
                                                    background: '#fff',
                                                    customClass: {
                                                        popup: 'rounded-2xl shadow-xl border border-slate-100',
                                                        confirmButton: 'bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-4 py-2',
                                                        cancelButton: 'bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg px-4 py-2'
                                                    }
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        deleteUserMutation.mutate(u.id);
                                                    }
                                                })
                                            }}
                                            className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                            title="Eliminar Usuario"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium text-lg">No se encontraron usuarios</p>
                            <p className="text-slate-400 text-sm mb-6">Comienza agregando miembros a tu equipo.</p>
                            <Button onClick={() => setShowCreateModal(true)} className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Crear primer usuario
                            </Button>
                        </div>
                    )}
                </div>

                {/* Modals */}
                {/* Edit User Modal */}
                <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                    <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-2xl rounded-2xl">
                        <DialogHeader>
                            <DialogTitle>Editar Usuario</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre</Label>
                                    <Input value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Usuario</Label>
                                    <Input value={editForm.username} onChange={e => setEditForm(prev => ({ ...prev, username: e.target.value }))} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Área</Label>
                                <Select value={editForm.area} onValueChange={val => setEditForm(prev => ({ ...prev, area: val }))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["admin", "corte", "bordado", "ensamble", "plancha", "calidad", "envios", "diseño", "patronaje", "almacen", "operaciones"].map(a => (
                                            <SelectItem key={a} value={a}>{getAreaDisplayName(a)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Nueva Contraseña (Opcional)</Label>
                                <Input type="password" placeholder="Dejar en blanco para mantener" value={editForm.newPassword} onChange={e => setEditForm(prev => ({ ...prev, newPassword: e.target.value }))} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancelar</Button>
                                <Button onClick={handleSaveEdit} disabled={updateUserMutation.isPending}>Guardar Cambios</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Reset Password Modal */}
                <Dialog open={showResetModal} onOpenChange={(open) => {
                    setShowResetModal(open);
                    if (!open) {
                        setNewPassword("");
                        setSelectedUser(null);
                    }
                }}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Restablecer Contraseña</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">
                                Ingresa la nueva contraseña para <strong>{selectedUser?.username}</strong>
                            </p>
                            <Input
                                type="password"
                                placeholder="Nueva contraseña"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <Button onClick={handleResetPassword} disabled={!newPassword || resetPasswordMutation.isPending} className="w-full">
                                {resetPasswordMutation.isPending ? "Procesando..." : "Confirmar Cambio"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </Layout>
    );
}
