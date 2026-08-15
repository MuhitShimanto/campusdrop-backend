import express from 'express';
import cors from 'cors';
import { auth } from './lib/auth.js';
import { toNodeHandler } from 'better-auth/node';
import config from './config/config.js';
import userRouter from './modules/user/user.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { routeNotFoundHandler } from './middleware/route-not-found-handler.js';

const app = express();

// Frontend CORS configuration
app.use(
  cors({
    origin: config.app.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

// Better Auth Middleware
app.all('/api/auth/*splat', toNodeHandler(auth));

// Express Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/users', userRouter);

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

// Error Handling
app.use(routeNotFoundHandler);
app.use(errorHandler);

export default app;
