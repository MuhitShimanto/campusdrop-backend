import dotenv from 'dotenv';
dotenv.config();

if(!process.env.DATABASE_URL || !process.env.DATABASE_NAME) {
  console.error('🌐⚠️ DATABASE_URL or DATABASE_NAME is not defined in the environment variables.');
  process.exit(1);
}

const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 3000,
  database: {
    name: process.env.DATABASE_NAME,
    url: process.env.DATABASE_URL,
  }
};
export default config;