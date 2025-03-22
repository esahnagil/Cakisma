import { Device, DeviceWithStatus, Monitor, MonitorResult, Alert } from "@/types";
import { queryClient } from "./queryClient";

// Websocket Olayları
interface WebSocketMessageData {
  device?: DeviceWithStatus;
  monitor?: Monitor;
  result?: MonitorResult;
  alert?: Alert;
  status?: string;
  code?: number;
  reason?: string;
  attempt?: number;
  delay?: number;
  event?: Event;
  attempts?: number;
  id?: number;
  monitorId?: number;
  [key: string]: unknown;
}

type MonitoringEventCallback = (eventType: string, data: WebSocketMessageData) => void;

class MonitoringClient {
  private socket: WebSocket | null = null;
  private eventCallbacks: MonitoringEventCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private isConnecting = false;

  /**
   * Initialize the WebSocket connection
   */
  connect() {
    if (this.socket || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    // Determine the WebSocket URL based on the current environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use a specific path for our monitoring WebSocket to avoid conflicts with Vite's WebSocket
    const host = window.location.host;
    let wsUrl = `${protocol}//${host}/ws/monitoring`;
    
    // Development ortamında farklı port kullanılıyorsa WebSocket bağlantısını ayarla
    if (import.meta.env.DEV && host.includes(':')) {
      const serverPort = 5000; // Express sunucusunun çalıştığı port
      const hostWithoutPort = host.split(':')[0];
      wsUrl = `${protocol}//${hostWithoutPort}:${serverPort}/ws/monitoring`;
    }

    try {
      console.log("WebSocket bağlantısı kuruluyor:", wsUrl);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
    
    // Otomatik ping-pong mekanizması kur (bağlantının açık kalmasını sağlar)
    this.setupPingPong();
  }
  
  /**
   * Setup a ping-pong mechanism to keep the connection alive
   */
  private setupPingPong() {
    let pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === this.socket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      } else if (!this.socket || this.socket.readyState !== this.socket.CONNECTING) {
        clearInterval(pingInterval);
      }
    }, 30000); // Her 30 saniyede bir ping gönder
    
    // Sayfa kapatıldığında interval'ı temizle
    window.addEventListener('beforeunload', () => {
      clearInterval(pingInterval);
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  /**
   * Register an event callback
   */
  on(callback: MonitoringEventCallback) {
    this.eventCallbacks.push(callback);
    return () => {
      this.eventCallbacks = this.eventCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen() {
    console.log("WebSocket connection established");
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.notifyCallbacks('connected', { status: 'connected' });
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      const { type, data: eventData } = data;
      
      // Heartbeat yanıtlarını filtrele
      if (type === 'pong') {
        console.debug('Received pong from server');
        return;
      }

      this.notifyCallbacks(type, eventData);

      // Update React Query cache based on event type
      this.updateQueryCache(type, eventData);
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent) {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    this.socket = null;
    this.isConnecting = false;
    this.notifyCallbacks('disconnected', { 
      code: event.code, 
      reason: event.reason 
    });

    // Attempt to reconnect if the connection wasn't closed intentionally
    if (event.code !== 1000) {
      this.attemptReconnect();
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event) {
    console.error("WebSocket hatası:", event);
    this.socket = null;
    this.isConnecting = false;
    this.notifyCallbacks('error', { event });
    
    // Hata durumunda yeniden bağlanmayı dene
    this.attemptReconnect();
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Maximum reconnection attempts reached");
      this.notifyCallbacks('reconnectFailed', { 
        attempts: this.reconnectAttempts 
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.notifyCallbacks('reconnecting', { 
      attempt: this.reconnectAttempts,
      delay
    });

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Notify all registered callbacks of an event
   */
  private notifyCallbacks(eventType: string, data: WebSocketMessageData) {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error("Error in monitoring event callback:", error);
      }
    });
  }

  /**
   * Update the React Query cache based on WebSocket events
   */
  private updateQueryCache(type: string, data: WebSocketMessageData) {
    switch (type) {
      case 'devices':
        queryClient.setQueryData(['/api/devices'], data);
        break;
      
      case 'alerts':
        queryClient.setQueryData(['/api/alerts'], data);
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
        break;
      
      case 'monitorUpdate':
        // Handle the unified monitor update event
        console.log('Received monitor update:', data);
        const { device, monitor, result } = data;
        
        // Update device status in the devices list
        const devices = queryClient.getQueryData<Device[]>(['/api/devices']);
        if (devices && device) {
          const updatedDevices = devices.map(existingDevice => {
            if (existingDevice.id === device.id) {
              return {
                ...existingDevice,
                // Cast existing device to DeviceWithStatus to add the additional fields
                status: device.status,
                responseTime: device.responseTime,
                lastCheck: device.lastCheck
              } as DeviceWithStatus;
            }
            return existingDevice;
          });
          queryClient.setQueryData(['/api/devices'], updatedDevices);
          
          // Invalidate single device data if it's loaded
          queryClient.invalidateQueries({ queryKey: ['/api/devices', device.id] });
        }
        
        // Update monitor results if monitor data is available
        if (monitor && result) {
          // Update the latest monitor result
          queryClient.setQueryData(
            ['/api/monitor-results', monitor.id, 'latest'],
            result
          );

          // Update monitor's latest result in monitors list
          const monitors = queryClient.getQueryData<Monitor[]>(['/api/monitors']);
          if (monitors) {
            const updatedMonitors = monitors.map(existingMonitor => {
              if (existingMonitor.id === monitor.id) {
                return {
                  ...existingMonitor,
                  latestResult: result
                };
              }
              return existingMonitor;
            });
            queryClient.setQueryData(['/api/monitors'], updatedMonitors);
          }
        }
        
        // Invalidate dashboard summary to show updated status counts
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
        break;
      
      // Keep the original event handlers for backward compatibility
      case 'deviceStatus':
        // Update device status in the devices list
        console.log('Received device status update:', data);
        
        // Update the device in the cache if it exists
        const deviceStatusUpdate = queryClient.getQueryData<Device[]>(['/api/devices']);
        if (deviceStatusUpdate && data.id) {
          const updatedDevices = deviceStatusUpdate.map(device => {
            if (device.id === data.id) {
              return {
                ...device,
                // Cast existing device to DeviceWithStatus
                status: data.status as 'online' | 'offline' | 'warning' | 'unknown',
                responseTime: data.responseTime as number,
                lastCheck: data.lastCheck as string
              } as DeviceWithStatus;
            }
            return device;
          });
          queryClient.setQueryData(['/api/devices'], updatedDevices);
        }
        
        // Invalidate single device data if it's loaded
        queryClient.invalidateQueries({ queryKey: ['/api/devices', data.id] });
        
        // Invalidate dashboard summary to show updated status counts
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
        break;
      
      case 'monitorResult':
        // Update the latest monitor result
        queryClient.setQueryData(
          ['/api/monitor-results', data.monitorId, 'latest'],
          data.result
        );

        // If we have monitors data in the cache, update the monitor's latest result
        const monitorResults = queryClient.getQueryData<Monitor[]>(['/api/monitors']);
        if (monitorResults) {
          const updatedMonitors = monitorResults.map(monitor => {
            if (monitor.id === data.monitorId) {
              return {
                ...monitor,
                latestResult: data.result
              };
            }
            return monitor;
          });
          queryClient.setQueryData(['/api/monitors'], updatedMonitors);
        }

        // Invalidate the dashboard summary to reflect new status
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
        break;
      
      case 'alert':
        // When a new alert is created, invalidate alerts queries
        queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
        break;
    }
  }
}

// Create a singleton instance
export const monitoringClient = new MonitoringClient();
