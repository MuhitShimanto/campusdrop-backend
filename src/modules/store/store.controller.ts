import type { Request, Response } from "express";
import { storeService } from "./store.service.js";
import { sendResponse } from "../../utils/response/sendResponse.js";
import { CreateStoreInput } from "./store.schema.js";

class StoreController {
    async getStore(req: Request, res: Response): Promise<void> {
        const result = await storeService.getStore(req.user?.id as string);
        sendResponse(res, 200, 'success', 'Store retrieved successfully', result);
    }
    async checkStoreSlug(req: Request, res: Response): Promise<void> {
        const { slug } = req.query;
        if (typeof slug !== 'string') {
            sendResponse(res, 400, 'error', 'Invalid slug parameter');
            return;
        }
        const isSlugAvailable = await storeService.isStoreSlugAvailable(slug);
        sendResponse(res, 200, 'success', 'Slug availability checked', { isAvailable: isSlugAvailable });
    }
    async createStore(req: Request, res: Response): Promise<void> {
        const input = req.validatedBody as CreateStoreInput;
        const result = await storeService.createStore(req.user?.id as string, input);
        sendResponse(res, 201, 'success', 'Store created successfully', result);
    }
    async updateStore(req: Request, res: Response): Promise<void> {
        const input = req.validatedBody as Partial<CreateStoreInput>;
        const result = await storeService.updateStore(req.user?.id as string, input);
        sendResponse(res, 200, 'success', 'Store updated successfully', result);
    }
}

export const storeController = new StoreController();
