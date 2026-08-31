import { categoryRepository } from "./category.repository.js";

class CategoryService {
    async getAllCategories() {
        const result = await categoryRepository.getAll();
        return result;
    }
}

export const categoryService = new CategoryService();