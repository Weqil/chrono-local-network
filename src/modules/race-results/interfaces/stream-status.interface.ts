export interface StreamStatus {
  race_id: number | null;
  is_stream_open: boolean;
  arrival_name?: string | null;
  arrival_type_id?: number | null;
}
