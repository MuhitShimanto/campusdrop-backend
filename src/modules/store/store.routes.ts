import {Router} from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { storeController } from './store.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { createStoreSchema, updateStoreSchema } from './store.schema.js';

const storeRouter = Router();

storeRouter.post('/', requireAuth, validateBody(createStoreSchema), asyncHandler(storeController.createStore))
storeRouter.patch('/', requireAuth, validateBody(updateStoreSchema), asyncHandler(storeController.updateStore))
storeRouter.get('/get-store', requireAuth, asyncHandler(storeController.getStore))
storeRouter.get('/check-store-slug', requireAuth, asyncHandler(storeController.checkStoreSlug))
// Public Route
storeRouter.get('/:storeSlug', asyncHandler(storeController.getStoreView))



export default storeRouter;