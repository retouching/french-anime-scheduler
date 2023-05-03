import { Router, type RouterType } from 'itty-router';
import type IEnvironment from './interfaces/IEnvironment';
import { asJSON } from './utils/responses';

function initRouter(): RouterType {
  const router = Router();
  router.all('*', () => asJSON('Not found', null, 404));
  return router;
}

async function handleRequest(request: Request, env: IEnvironment): Promise<Response> {
  if (!env.ROUTER) env.ROUTER = initRouter();
  return await env.ROUTER.handle(request, env);
}

export default handleRequest;
