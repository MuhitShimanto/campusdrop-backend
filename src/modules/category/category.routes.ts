import {Router} from "express";
import { categoryController } from "./category.controller.js";

const categoryRouter = Router();

categoryRouter.get('/', categoryController.getAllCategories);

export default categoryRouter;