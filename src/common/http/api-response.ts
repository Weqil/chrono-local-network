export function apiSuccess<T>(
  message: string,
  code: number,
  data: T,
) {
  return {
    status: 'success' as const,
    code,
    message,
    data,
  };
}
