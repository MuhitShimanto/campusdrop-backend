import {Router} from "express";
import { dropImageController } from "./drop_image.controller.js";
import { validateBody } from "../../middleware/validate.js";
import { createDropImageSchema } from "./store_image.schema.js";

const dropImageRouter = Router();

dropImageRouter.post('/', validateBody(createDropImageSchema), dropImageController.createDropImage)

export default dropImageRouter;