import PusherServer from "pusher";
import PusherClient from "pusher-js";
import { isBuildTime } from "./db-build-helper";

// Debug Pusher environment variables in development
if (process.env.NODE_ENV === 'development') {
  console.log('[PUSHER ENV CHECK]', {
    appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID ? 'defined' : 'undefined',
    key: process.env.NEXT_PUBLIC_PUSHER_KEY ? 'defined' : 'undefined',
    secret: process.env.PUSHER_SECRET ? 'defined' : 'undefined',
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ? 'defined' : 'undefined',
    clusterValue: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  });
}

// Default cluster should match what's in .env.local (us2)
const defaultCluster = 'us2';
const defaultAppId = 'build-app-id';
const defaultAppKey = 'build-app-key';
const defaultSecret = 'build-secret';

// Create a mock Pusher server instance during build
class MockPusherServer {
  async trigger() {
    console.warn('Mock PusherServer: Operation not available during build');
    return Promise.resolve();
  }
  
  authorizeChannel() {
    console.warn('Mock PusherServer: authorizeChannel not available during build');
    return { auth: 'mock-auth-token' };
  }
}

// Create Pusher Server instance conditionally
export const pusherServer = isBuildTime() 
  ? new MockPusherServer() as unknown as PusherServer
  : new PusherServer({
      appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID || defaultAppId,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY || defaultAppKey,
      secret: process.env.PUSHER_SECRET || defaultSecret,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || defaultCluster,
      useTLS: true,
    });

// Only create Pusher Client in browser context
export const pusherClient = typeof window !== 'undefined'
  ? new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY || defaultAppKey, 
      {
        channelAuthorization: {
          endpoint: "/api/pusher/auth",
          transport: "ajax",
        },
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || defaultCluster,
      }
    )
  : null as unknown as PusherClient; // Cast to PusherClient to maintain type safety
