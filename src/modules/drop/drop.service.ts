import { generateUuid } from '../../lib/uuid.js';
import { storeService } from '../store/store.service.js';
import { dropRepository } from './drop.repository.js';
import { CreateAlwaysOnInput, CreatePreOrderInput } from './store.schema.js';

class DropService {
  async createPreOrder(input: CreatePreOrderInput, user_id: string) {
    const {store_id} = await storeService.getStore(user_id) as {store_id: string};
    // Generate a unique listing_id for the new drop
    const listing_id = generateUuid();
    const result = await dropRepository.createPreOrder({...input, listing_id, store_id});
    return result;
  }
  async createAlwaysOn(input: CreateAlwaysOnInput, user_id: string) {
    const {store_id} = await storeService.getStore(user_id) as {store_id: string};
    // Generate a unique listing_id for the new drop
    const listing_id = generateUuid();
    const result = await dropRepository.createAlwaysOn({...input, listing_id, store_id});
    return result;
  }
  async getMyListings(store_id: string) {
    const result = await dropRepository.getMyListings(store_id);
    return result;
  }
  async getListingById(listing_id: string) {
    const result = await dropRepository.getListingById(listing_id);
    return result;
  }
}

export const dropService = new DropService();
