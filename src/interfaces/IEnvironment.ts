import { type RouterType } from 'itty-router';

export default interface IEnvironment {
  DB: KVNamespace;
  ROUTER: RouterType | null;
};
