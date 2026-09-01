import { parseStandardSchema } from 'better-auth/client';
import { generateUuid } from '../../lib/uuid.js';
import { storeService } from '../store/store.service.js';
import { dropRepository } from './drop.repository.js';
import { CreateAlwaysOnInput, CreatePreOrderInput } from './store.schema.js';

class DropService {
  async createPreOrder(input: CreatePreOrderInput, user_id: string) {
    const { store_id } = (await storeService.getStore(user_id)) as { store_id: string };
    // Generate a unique listing_id for the new drop
    const listing_id = generateUuid();
    const result = await dropRepository.createPreOrder({ ...input, listing_id, store_id });
    return result;
  }
  async createAlwaysOn(input: CreateAlwaysOnInput, user_id: string) {
    const { store_id } = (await storeService.getStore(user_id)) as { store_id: string };
    // Generate a unique listing_id for the new drop
    const listing_id = generateUuid();
    const result = await dropRepository.createAlwaysOn({ ...input, listing_id, store_id });
    return result;
  }
  async getMyListings(store_id: string) {
    const result = await dropRepository.getMyListings(store_id);
    return result;
  }
  async getListingById(listing_id: string) {
    const type = await dropRepository.getListingTypeById(listing_id);
    if(type === 'always_on') {
      const result = await dropRepository.getAlwaysOnListingById(listing_id);
      return result;
    }
    const result = await dropRepository.getPreOrderListingById(listing_id);
    return result;
  }
  async getListings(filters: { preorderCount: number; alwaysOnCount: number; sortBy: string }) {
    const [preOrders, alwaysOn] = await Promise.all([
      dropRepository.getPreOrders(filters.preorderCount, filters.sortBy),
      dropRepository.getAlwaysOn(filters.alwaysOnCount, filters.sortBy),
    ]);
    const result = {
      preOrders,
      alwaysOn,
    };
    return result;
  }
  async getListingTypeById(listing_id: string) {
    const result = await dropRepository.getListingTypeById(listing_id);
    return result;
  }
}

export const dropService = new DropService();
