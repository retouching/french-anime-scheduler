export function asJSON(
  message: string | null = null,
  data: Record<string, any> | null = null,
  status: number = 200
): Response {
  if (!status) status = 200;
  if (!message && !data) throw new Error('You must set message or data');
  if (!message && status > 399) throw new Error('Error response must include message');

  const response: Record<string, any> = {};

  if (message) response[status > 399 ? 'error' : 'message'] = message;
  if (data) response.data = data;

  return new Response(JSON.stringify(response, null, 2), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });
}
