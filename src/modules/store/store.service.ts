import { generateUuid } from '../../lib/uuid.js';
import { storeRepository } from './store.repository.js';
import { CreateStoreInput } from './store.schema.js';
import { errorHandler } from '../../middleware/error-handler.js';
import { AppError } from '../../utils/errors/app-error.js';

class StoreService {
  async getStore(user_id: string) {
    const result = await storeRepository.getStore(user_id);
    return result;
  }
  async isStoreSlugAvailable(slug: string) {
    const isAvailable = await storeRepository.isStoreSlugAvailable(slug);
    return isAvailable;
  }
  async createStore(user_id: string, input: CreateStoreInput) {
    // Check if the user already has a store
    const existingStore = await storeRepository.getStore(user_id);
    if (existingStore) {
      throw new Error('User already has a store');
    }
    // Check if the slug is already taken
    const isSlugAvailable = await storeRepository.isStoreSlugAvailable(input.slug);
    if (!isSlugAvailable) {
      throw new Error('Store handle is not available');
    }
    const result = await storeRepository.createStore(generateUuid(), user_id, input);
    return result;
  }
  async updateStore(user_id: string, input: Partial<CreateStoreInput>) {
    const existingStore = await storeRepository.getStore(user_id);
    if (!existingStore) {
      throw new Error('Store not found');
    }
    const result = await storeRepository.update(user_id, input);
    return result;
  }
}

export const storeService = new StoreService();
