import dotenv from 'dotenv';
dotenv.config();

if(!process.env.DATABASE_URL || !process.env.DATABASE_NAME) {
  console.error('🌐⚠️ DATABASE_URL or DATABASE_NAME is not defined in the environment variables.');
  process.exit(1);
}
if(!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('🌐⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not defined in the environment variables.');
  process.exit(1);
}

const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 3000,
  database: {
    name: process.env.DATABASE_NAME,
    url: process.env.DATABASE_URL,
  },
  auth: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
  }
};
export default config;