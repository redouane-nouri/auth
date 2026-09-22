import { createClient } from "redis";
/*
  Logs a Redis client failure
*/
const logRedisError = (err: unknown) =>
  console.error("Redis Client Error", err);
/*
 Redis client Singleton factory function.
*/
const redisClientSingleton = () => {
  const client = createClient({ url: process.env.REDIS_URL });
  /*
   Connect right away without awaiting it, the client queues up commands issued before the connection.
  */
  client.on("error", logRedisError).connect().catch(logRedisError);
  return client;
};
/*
 declare the global this that has redis client inside it.
*/
declare const globalThis: {
  redisGlobal: ReturnType<typeof redisClientSingleton>;
} & typeof global;

/*
  Check prism-client, this fixes the issue made by hot reload.
*/
const redisClient = globalThis.redisGlobal ?? redisClientSingleton();

export default redisClient;

if (process.env.NODE_ENV !== "production") globalThis.redisGlobal = redisClient;
