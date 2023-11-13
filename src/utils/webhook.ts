export default {
  send: async function(url: string, data: Record<string, any>): Promise<Response> {
    return await fetch(`${url}?wait=true`, {
      headers: new Headers({
        'Content-Type': 'application/json;charset=UTF-8'
      }),
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
