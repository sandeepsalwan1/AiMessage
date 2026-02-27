/**
 * Helper to prevent database operations during build time
 * This is used to skip database operations when Next.js is building the app
 * in environments like Vercel where a database might not be available
 */

// Check if we're in a build environment (typically Vercel build process)
// export const isBuildTime = () => {
//   // During build time, window is undefined
//   return typeof window === 'undefined' && 
//     // And we're in a production environment or specifically in a Vercel build
//     (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV);
// };

export const isBuildTime = () => {
  return process.env.VERCEL_BUILD === '1';  // Only true during build time
};

// This function returns either real data or mock data during build
export const safeFetch = async <T>(
  fetchFn: () => Promise<T>,
  mockData: T
): Promise<T> => {
  // If we're in build time, return mock data
  if (isBuildTime()) {
    console.warn('Running in build mode - returning mock data');
    return mockData;
  }
  
  // Otherwise, perform the actual fetch
  try {
    return await fetchFn();
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}; 