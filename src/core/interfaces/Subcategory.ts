import {Category} from "@/src/core/interfaces/Category";


export interface Subcategory {
  id: number;
  name: string;
  description: string;
  category: Category;
}