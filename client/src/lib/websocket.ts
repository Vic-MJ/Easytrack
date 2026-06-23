import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationService, formatNotificationContent } from './notifications';

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 2000;
  private listeners: Set<(data: any) => void> = new Set();
  private isConnecting = false;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;

    try {
      this.isConnecting = true;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      console.log('Intentando conectar WebSocket a:', wsUrl);

      if (!host || host === 'undefined' || !wsUrl.includes('://')) {
        console.error('URL de WebSocket inválida:', wsUrl);
        this.isConnecting = false;
        return;
      }

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket conectado exitosamente');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Notificación WebSocket recibida:', data);
          this.listeners.forEach(listener => listener(data));
        } catch (error) {
          console.error('Error al procesar mensaje WebSocket:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket desconectado, código:', event.code);
        this.isConnecting = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('Error al crear WebSocket:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Intentando reconectar WebSocket en ${this.reconnectInterval / 1000} segundos... (Intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.error('Máximo número de intentos de reconexión alcanzado.');
    }
  }

  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket no está conectado, mensaje no enviado:', message);
    }
  }

  addListener(listener: (data: any) => void) {
    this.listeners.add(listener);
    return () => this.removeListener(listener);
  }

  removeListener(listener: (data: any) => void) {
    this.listeners.delete(listener);
  }
}

// Singleton instance
const globalWebSocketManager = new WebSocketManager();

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    globalWebSocketManager.connect();
    setIsConnected(true);

    const messageListener = (message: any) => {
      if (message.type !== 'notification') return;

      const notification = message.data;
      console.log('Nueva notificación recibida:', notification);

      // Invalidar queries relacionadas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // También invalidar otras queries según el tipo de notificación
      if (notification.type?.includes('order')) {
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      }
      if (notification.type?.includes('reposition')) {
        queryClient.invalidateQueries({ queryKey: ['/api/repositions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-activity'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      }

      // Invalidar específicamente las queries del dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-activity'] });

      // Mostrar notificación del navegador
      const notificationService = NotificationService.getInstance();
      const { title, body, data } = formatNotificationContent(notification);

      notificationService.showNotification(title, {
        body,
        tag: `notification-${notification.id || Date.now()}`,
        data
      });
    };

    return globalWebSocketManager.addListener(messageListener);
  }, [queryClient]);

  const sendMessage = useCallback((message: any) => {
    globalWebSocketManager.sendMessage(message);
  }, []);

  const onMessage = useCallback((callback: (data: any) => void) => {
    return globalWebSocketManager.addListener(callback);
  }, []);

  return { isConnected, sendMessage, onMessage };
}