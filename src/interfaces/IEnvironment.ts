import { type RouterType } from 'itty-router';

export default interface Env {
  DB: KVNamespace
  ROUTER: RouterType | null
};
