import type {Request, Response} from "express";
import { sendResponse } from "../../utils/response/sendResponse.js";
import { categoryRepository } from "./category.repository.js";
import { categoryService } from "./category.service.js";

class CategoryController {
    async getAllCategories(req: Request, res: Response) {
        const result = await categoryService.getAllCategories();
        sendResponse(res, 200, "success", "Categories retrieved successfully", result);
    }
}

export const categoryController = new CategoryController();