import express from 'express';
import cors from 'cors';
import { auth } from './lib/auth.js';
import { toNodeHandler } from 'better-auth/node';
import config from './config/config.js';
import userRouter from './modules/user/user.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { routeNotFoundHandler } from './middleware/route-not-found-handler.js';
import storeRouter from './modules/store/store.routes.js';
import dropRouter from './modules/drop/drop.routes.js';
import dropImageRouter from './modules/drop_image/drop_image.routes.js';
import categoryRouter from './modules/category/category.routes.js';

const app = express();

// Frontend CORS configuration
app.use(
  cors({
    origin: config.app.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

// Better Auth Middleware
app.all('/api/auth/*splat', toNodeHandler(auth));

// Express Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/stores', storeRouter);
app.use('/api/v1/drops', dropRouter);
app.use('/api/v1/drop-images', dropImageRouter);
app.use('/api/v1/categories', categoryRouter);

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

// Error Handling
app.use(routeNotFoundHandler);
app.use(errorHandler);

export default app;
