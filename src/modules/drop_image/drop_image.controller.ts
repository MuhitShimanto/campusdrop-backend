import type {Request, Response} from "express";
import { CreateDropImageInput } from "./store_image.schema.js";
import { dropImageService } from "./drop_image.service.js";
import { sendResponse } from "../../utils/response/sendResponse.js";

class DropImageController {
    async createDropImage(req: Request, res: Response) {
        const input = req.validatedBody as CreateDropImageInput;
        const result = await dropImageService.createDropImage(input);
        sendResponse(res, 200, 'success', 'Image stored successfully', result)
    }
}

export const dropImageController = new DropImageController();