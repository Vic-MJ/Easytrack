
export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkPermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones push');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;

    return permission === 'granted';
  }

  private playNotificationSound(): void {
    try {
      // Crear un contexto de audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Configurar volumen principal para que no sea muy fuerte
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.value = 0.4;

      // Primer tono (Ding)
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(masterGain);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, audioContext.currentTime); // Nota Sol (G5)
      gain1.gain.setValueAtTime(1, audioContext.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      osc1.start(audioContext.currentTime);
      osc1.stop(audioContext.currentTime + 0.4);

      // Segundo tono (Dong) - un poco más grave y retrasado
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(masterGain);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.15); // Nota Do (C5)

      // Empieza en silencio, sube cuando le toca y luego baja
      gain2.gain.setValueAtTime(0, audioContext.currentTime);
      gain2.gain.setValueAtTime(1, audioContext.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

      osc2.start(audioContext.currentTime + 0.15);
      osc2.stop(audioContext.currentTime + 0.8);

    } catch (error) {
      console.warn('No se pudo reproducir el sonido de notificación:', error);
    }
  }

  public async showNotification(title: string, options: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
    silent?: boolean;
  } = {}): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('No hay permisos para mostrar notificaciones');
      return;
    }

    // Si la página está visible, no mostrar notificación (comentado para que siempre avise)
    // if (document.visibilityState === 'visible') {
    //   return;
    // }

    const defaultOptions = {
      icon: '/icono_pestaña.png',
      badge: '/icono_pestaña.png',
      requireInteraction: false, // Falso para que Windows permita eliminarla de la barra lateral al hacer .close()
      silent: false,
      ...options
    };

    try {
      // Reproducir sonido si no está silenciado
      if (!defaultOptions.silent) {
        this.playNotificationSound();
      }

      const notification = new Notification(title, defaultOptions);

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();

        // Si hay datos específicos, navegar a la página correspondiente
        if (options.data?.path) {
          window.location.hash = options.data.path;
        }
      };

      // Auto cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
      }, 15000);

    } catch (error) {
      console.error('Error al mostrar notificación:', error);
    }
  }

  public getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  public isSupported(): boolean {
    return 'Notification' in window;
  }
}

// Función helper para formatear notificaciones según el tipo
export function formatNotificationContent(notification: any): {
  title: string;
  body: string;
  data?: any;
} {
  const { type, message, orderId, repositionId } = notification;

  switch (type) {
    case 'new_order':
      return {
        title: '📦 Nueva Orden',
        body: message || 'Se ha creado una nueva orden',
        data: { path: '#/orders' }
      };

    case 'order_completed':
      return {
        title: '✅ Orden Completada',
        body: message || `Orden ${orderId} completada`,
        data: { path: '#/orders' }
      };

    case 'new_reposition':
    case 'reposition_created':
      return {
        title: '🔄 Nueva Reposición',
        body: message || 'Se ha creado una nueva reposición',
        data: { path: '#/repositions' }
      };

    case 'reposition_approved':
      return {
        title: '✅ Reposición Aprobada',
        body: message || `Reposición ${repositionId} aprobada`,
        data: { path: '#/repositions' }
      };

    case 'reposition_rejected':
      return {
        title: '❌ Reposición Rechazada',
        body: message || `Reposición ${repositionId} rechazada`,
        data: { path: '#/repositions' }
      };

    case 'transfer':
    case 'reposition_transfer':
      return {
        title: '🚚 Transferencia',
        body: message || 'Nueva transferencia procesada',
        data: { path: '#/orders' }
      };

    case 'completion_approval_needed':
      return {
        title: '⏰ Aprobación Necesaria',
        body: message || 'Se requiere aprobación para completar',
        data: { path: '#/orders' }
      };

    case 'partial_transfer_warning':
      return {
        title: '⚠️ Transferencia Parcial',
        body: message || 'Advertencia de transferencia parcial',
        data: { path: '#/orders' }
      };

    default:
      return {
        title: '🔔 Nueva Notificación',
        body: message || 'Tienes una nueva notificación',
        data: { path: '#/dashboard' }
      };
  }
}
