export interface Device {
  id: number;
  name: string;
  ipAddress: string;
  type: string;
  location?: string;
  maintenanceMode?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BaseMonitorConfig {
  timeoutSeconds: number;
  thresholdMs: number;
  retries: number;
}

export interface ICMPConfig extends BaseMonitorConfig {
  packetSize?: number;
  ttl?: number;
}

export interface HTTPConfig extends BaseMonitorConfig {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  validateSSL?: boolean;
  expectedStatusCode?: number;
  requestTimeoutMs?: number;
}

export interface TCPConfig extends BaseMonitorConfig {
  port: number;
  connectionTimeoutMs?: number;
}

export interface SNMPConfig extends BaseMonitorConfig {
  oids: string[];
  community?: string;
  version?: string;
  port?: number;
}

export type MonitorConfig = ICMPConfig | HTTPConfig | TCPConfig | SNMPConfig;

export interface Monitor {
  id: number;
  deviceId: number;
  type: 'icmp' | 'http' | 'tcp' | 'snmp';
  config: MonitorConfig;
  enabled: boolean;
  interval: number;
  createdAt: string;
  updatedAt: string;
  latestResult?: MonitorResult;
}

export interface MonitorResultDetails {
  error?: string;
  message?: string;
  statusCode?: number;
  headers?: Record<string, string>;
  responseBody?: string;
  packetLoss?: number;
  roundTripTime?: {
    min?: number;
    avg?: number;
    max?: number;
  };
  [key: string]: unknown;
}

export interface MonitorResult {
  id: number;
  monitorId: number;
  timestamp: string;
  status: 'online' | 'offline' | 'warning' | 'unknown';
  responseTime?: number;
  details?: MonitorResultDetails;
}

export interface Alert {
  id: number;
  deviceId: number;
  monitorId: number;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface DashboardSummary {
  devices: {
    total: number;
    online: number;
    percentage: number;
  };
  webServices: {
    total: number;
    online: number;
    percentage: number;
  };
  activeAlerts: number;
  averageResponseTime: number;
}

export interface DeviceWithStatus extends Device {
  status?: 'online' | 'offline' | 'warning' | 'unknown';
  responseTime?: number; // Used for both API and real-time websocket updates
  lastCheck?: string;  // Used for both API and real-time websocket updates
}

export interface DeviceWithMonitors extends Device {
  monitors?: Monitor[];
  totalMonitors?: number;
  activeMonitors?: number;
  status?: 'online' | 'offline' | 'warning' | 'unknown';
}

export interface DeviceTypeIcon {
  [key: string]: JSX.Element;
}

export interface DeviceTypeLabel {
  [key: string]: string;
}
