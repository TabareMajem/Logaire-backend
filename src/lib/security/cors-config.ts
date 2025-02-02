const allowedOrigins = new Set([
  process.env.NEXT_PUBLIC_APP_URL,
  'https://api.yourapp.com',
  'https://admin.yourapp.com'
]);

export function isAllowedOrigin(origin: string): boolean {
  return allowedOrigins.has(origin);
}

export const corsOptions = {
  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'Accept',
    'X-Requested-With'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  maxAge: 86400 // 24 hours
}; 