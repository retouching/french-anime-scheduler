import { Router, type RouterType } from 'itty-router';
import type IEnvironment from './interfaces/IEnvironment';
import { asJSON } from './utils/responses';
import episodes from './schedulers/episodes';
import rss from './routes/rss';

function initRouter(): RouterType {
  const router = Router();
  router.get('/rss', rss);
  router.all('*', () => asJSON('Not found', null, 404));
  return router;
}

async function handleRequest(request: Request, env: IEnvironment, ctx: ExecutionContext): Promise<Response> {
  if (!env.ROUTER) env.ROUTER = initRouter();
  return await env.ROUTER.handle(request, env, ctx);
}

function handleScheduler(controller: ScheduledController, env: IEnvironment, ctx: ExecutionContext): void {
  ctx.waitUntil(Promise.allSettled([
    episodes(controller, env, ctx)
  ]));
}

export default {
  fetch: handleRequest,
  scheduled: handleScheduler
};
