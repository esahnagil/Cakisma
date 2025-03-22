import { useMonitoring } from './use-monitoring';
import { useState, useEffect } from 'react';

/**
 * @deprecated Kullanımdan kaldırılmıştır. Bunun yerine `useMonitoring` kullanın.
 */
export function useWebSocket() {
  const [lastMetric, setLastMetric] = useState<any>(null);
  const { lastEvent } = useMonitoring(); // Var olan useMonitoring hook'unu kullan
  
  useEffect(() => {
    // useMonitoring'den gelen monitorUpdate olaylarını izle
    if (lastEvent && lastEvent.type === 'monitorUpdate') {
      // monitorUpdate içindeki device verilerini kullanarak son metriği güncelle
      const { device } = lastEvent.data;
      if (device) {
        setLastMetric({
          deviceId: device.id,
          status: device.status,
          responseTime: device.responseTime,
          timestamp: device.lastCheck || new Date().toISOString()
        });
      }
    }
  }, [lastEvent]);
  
  console.warn('useWebSocket hook\'u kullanımdan kaldırılmıştır. Bunun yerine useMonitoring hook\'unu kullanın.');
  
  return { lastMetric };
}
