import type { Request, Response } from 'express';
import { dropService } from './drop.service.js';
import { CreateAlwaysOnInput, CreatePreOrderInput } from './store.schema.js';
import { storeService } from '../store/store.service.js';
import { sendResponse } from '../../utils/response/sendResponse.js';
import { DropFilters } from './drop.model.js';

class DropController {
  async createPreOrder(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as CreatePreOrderInput;
    const preorder = await dropService.createPreOrder(input, req.user?.id);
    res.status(201).json(preorder);
  }
  async createAlwaysOn(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as CreateAlwaysOnInput;
    const alwaysOn = await dropService.createAlwaysOn(input, req.user?.id);
    res.status(201).json(alwaysOn);
  }
  async getMyListings(req: Request, res: Response): Promise<void> {
    const user_id = req.user?.id;
    const { store_id } = (await storeService.getStore(user_id)) as { store_id: string };
    const result = await dropService.getMyListings(store_id);
    sendResponse(res, 200, 'success', 'Listings retrieved successfully', result);
  }
  async getListingById(req: Request, res: Response): Promise<void> {
    const listing_id = req.params.listing_id;
    const result = await dropService.getListingById(listing_id as string);
    sendResponse(res, 200, 'success', 'Listing retrieved successfully', result);
  }
  async getListings(req: Request, res: Response): Promise<void> {
    const {preorder, always_on, sortBy} = req.query;
    const result = await dropService.getListings({preorderCount: Number(preorder), alwaysOnCount: Number(always_on), sortBy: sortBy as string});
    sendResponse(res, 200, 'success', 'Listings retrieved successfully', result);
  }
}

export const dropController = new DropController();
