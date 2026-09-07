export const NOTIFY_DEPARTURE_STARTED_EVENT = 'notify.departure.started';
export const NOTIFY_DEPARTURE_COMPLETED_EVENT = 'notify.departure.completed';

export interface DepartureNotifyPayload {
  arrival_sync_id: string;
  arrival_name: string;
  race_sync_id: string;
  device_id: string;
  at_ms: number;
}

export function isDepartureNotifyPayload(
  payload: unknown,
): payload is DepartureNotifyPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  return (
    typeof p.arrival_sync_id === 'string' &&
    p.arrival_sync_id.length > 0 &&
    typeof p.arrival_name === 'string' &&
    typeof p.race_sync_id === 'string' &&
    p.race_sync_id.length > 0 &&
    typeof p.device_id === 'string' &&
    p.device_id.length > 0 &&
    typeof p.at_ms === 'number'
  );
}
