// Utility to check if we're in build time
export const isBuildTime = () => {
  return process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV && !process.env.MONGODB_URI;
};

// Utility to handle build-time API route calls
export const handleBuildTimeError = (error: string) => {
  if (isBuildTime()) {
    console.warn(`Build time: ${error}`);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Service unavailable during build' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return null;
};