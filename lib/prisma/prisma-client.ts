import { PrismaClient } from "@prisma/client";
/*
 Prisma client Singleton factory function.
*/
const prismaClientSingleton = () => {
  return new PrismaClient();
};
/*
 declare the global this that has prisma client inside it.
*/
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

/*
 In development, the command next dev clears Node.js cache on run. This in turn initializes a new PrismaClient instance each time due to hot reloading that creates a connection to the database. This can quickly exhaust the database connections as each PrismaClient instance holds its own connection pool.

 The solution in this case is to instantiate a single instance PrismaClient and save it on the globalThis object. Then we keep a check to only instantiate PrismaClient if it's not on the globalThis object otherwise use the same instance again if already present to prevent instantiating extra PrismaClient instances.
*/
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
