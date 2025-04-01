import { PrismaClient } from "@prisma/client";
import { isBuildTime } from "./db-build-helper";

declare global {
  var prisma: PrismaClient | undefined;
}

// During build time, create a more comprehensive mock client
class MockPrismaClient {
  constructor() {
    // Create a proxy to intercept all property accesses and method calls
    return new Proxy({}, {
      get: (target, prop) => {
        // Handle common Prisma model access (user, conversation, etc.)
        if (['user', 'conversation', 'message', 'account', 'userConversation', 'userSeenMessage'].includes(prop as string)) {
          // Return a model proxy that handles CRUD operations
          return new Proxy({}, {
            get: (modelTarget, operation) => {
              // Handle common CRUD operations and return empty results
              if (['findUnique', 'findFirst', 'findMany', 'create', 'update', 'delete', 'count'].includes(operation as string)) {
                return (...args: any[]) => {
                  console.warn(`Mock PrismaClient: ${String(prop)}.${String(operation)} called during build`);
                  
                  // Return appropriate mock data based on the operation
                  if (operation === 'findMany') {
                    return Promise.resolve([]);
                  } else if (operation === 'count') {
                    return Promise.resolve(0); 
                  } else if (['findUnique', 'findFirst', 'create', 'update'].includes(operation as string)) {
                    return Promise.resolve(null);
                  } else {
                    return Promise.resolve(null);
                  }
                };
              }
              
              // Handle transaction operations
              if (operation === '$transaction') {
                return (operations: any[]) => {
                  console.warn('Mock PrismaClient: $transaction called during build');
                  return Promise.resolve(operations.map(() => null));
                };
              }
              
              // Default handler for any other operations
              return () => {
                console.warn(`Mock PrismaClient: ${String(prop)}.${String(operation)} is not implemented in mock`);
                return Promise.resolve(null);
              };
            }
          });
        }
        
        // Handle connection methods
        if (prop === '$connect' || prop === '$disconnect') {
          return () => {
            console.warn(`Mock PrismaClient: ${String(prop)} called during build`);
            return Promise.resolve();
          };
        }
        
        // Handle any other property access
        return () => {
          console.warn(`Mock PrismaClient: ${String(prop)} is not implemented in mock`);
          return Promise.resolve(null);
        };
      }
    });
  }
}

// Use mock client during build, real client during runtime
const createClient = () => {
  if (isBuildTime()) {
    console.warn('Using mock PrismaClient during build time');
    return new MockPrismaClient() as unknown as PrismaClient;
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

// Create the appropriate client based on environment
const client = globalThis.prisma || createClient();

// Save client to global object in development to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = client;
}

export default client;

