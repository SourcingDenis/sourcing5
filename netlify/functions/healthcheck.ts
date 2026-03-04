import type { Handler } from '@netlify/functions';

const handler: Handler = async () => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
    }),
  };
};

export { handler };
