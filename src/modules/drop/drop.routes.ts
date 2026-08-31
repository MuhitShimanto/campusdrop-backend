import {Router} from "express";
import { dropController } from "./drop.controller.js";
import { validateBody } from "../../middleware/validate.js";
import { createAlwaysOnSchema, createPreOrderSchema } from "./store.schema.js";
import { requireAuth } from "../../middleware/require-auth.js";

const dropRouter = Router();


dropRouter.post('/create-preorder', requireAuth, validateBody(createPreOrderSchema), dropController.createPreOrder)
dropRouter.post(`/create-alwayson`, requireAuth, validateBody(createAlwaysOnSchema), dropController.createAlwaysOn)
dropRouter.get(`/get-my-drops`, requireAuth, dropController.getMyListings)
// Public Routes
dropRouter.get(`/:listing_id`, dropController.getListingById)

export default dropRouter;