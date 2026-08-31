import { generateUuid } from "../../lib/uuid.js";
import { dropImageRepository } from "./drop_image.repository.js";
import { CreateDropImageInput } from "./store_image.schema.js";

class DropImageService {
    async createDropImage(input: CreateDropImageInput) {
        // Generate UUID for the image_id
        const imageId = generateUuid();
        const result = await dropImageRepository.createDropImage({ ...input, image_id: imageId });
        return {
            image_id: imageId,
            listing_id: input.listing_id,
            url: input.url,
            sort_order: input.sort_order
        }
    }
}

export const dropImageService = new DropImageService();