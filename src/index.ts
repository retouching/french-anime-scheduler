import { Router, type RouterType } from 'itty-router';
import type IEnvironment from './interfaces/IEnvironment';
import { asJSON } from './utils/responses';

function initRouter(): RouterType {
  const router = Router();
  router.all('*', () => asJSON('Not found', null, 404));
  return router;
}

async function handleRequest(request: Request, env: IEnvironment, ctx: ExecutionContext): Promise<Response> {
  if (!env.ROUTER) env.ROUTER = initRouter();
  return await env.ROUTER.handle(request, env, ctx);
}

function handleScheduler(controller: ScheduledController, env: IEnvironment, ctx: ExecutionContext): void {
}

export default {
  fetch: handleRequest,
  scheduled: handleScheduler
};
