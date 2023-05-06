import { type RouterType } from 'itty-router';

export default interface IEnvironment {
  DB: KVNamespace;
  ROUTER: RouterType | null;
  WEBHOOK_URL: string | null;
  MENTIONS: string;
};
