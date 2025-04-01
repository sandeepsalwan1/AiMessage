// Simple test script to debug Pusher message functionality
// Run this with Node.js to test Pusher connectivity

const PusherServer = require('pusher');
const PusherClient = require('pusher-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('=== Pusher Debug Test ===');

// Log environment variables (without sensitive values)
console.log('Environment Variables Check:');
console.log(`NEXT_PUBLIC_PUSHER_APP_ID: ${process.env.NEXT_PUBLIC_PUSHER_APP_ID ? '✓' : '✗'}`);
console.log(`NEXT_PUBLIC_PUSHER_KEY: ${process.env.NEXT_PUBLIC_PUSHER_KEY ? '✓' : '✗'}`);
console.log(`PUSHER_SECRET: ${process.env.PUSHER_SECRET ? '✓' : '✗'}`);
console.log(`NEXT_PUBLIC_PUSHER_CLUSTER: ${process.env.NEXT_PUBLIC_PUSHER_CLUSTER ? '✓' : '✗'}`);

// Check for cluster mismatch
const envCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
console.log(`Using Pusher cluster: ${envCluster}`);

// Initialize Pusher server instance
const pusherServer = new PusherServer({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

// Initialize Pusher client
const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
});

// Test variables
const testChannel = 'test-channel';
const testEvent = 'test-event';
const testMessage = { message: 'Test message', timestamp: new Date().toISOString() };

// Set up connection status logging
pusherClient.connection.bind('state_change', (states) => {
  console.log(`Pusher connection: ${states.previous} -> ${states.current}`);
});

pusherClient.connection.bind('connected', () => {
  console.log('✅ Successfully connected to Pusher');
});

pusherClient.connection.bind('error', (error) => {
  console.error('❌ Pusher connection error:', error);
});

// Subscribe to test channel
const channel = pusherClient.subscribe(testChannel);

// Listen for test event
channel.bind(testEvent, (data) => {
  console.log('✅ Received test message:', data);
  console.log('Test complete - message successfully sent and received');
  
  // Clean up
  setTimeout(() => {
    pusherClient.unsubscribe(testChannel);
    pusherClient.disconnect();
    process.exit(0);
  }, 1000);
});

// Trigger test event after a short delay
setTimeout(async () => {
  try {
    console.log('Sending test message...');
    await pusherServer.trigger(testChannel, testEvent, testMessage);
    console.log('✅ Test message sent');
  } catch (error) {
    console.error('❌ Error sending test message:', error);
    process.exit(1);
  }
}, 2000);

// Set a timeout to exit if the test doesn't complete
setTimeout(() => {
  console.error('❌ Test timed out - no message received');
  process.exit(1);
}, 10000); 