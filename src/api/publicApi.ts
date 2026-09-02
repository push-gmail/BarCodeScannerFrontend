import { api } from "./client";

export type PublicCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: "active";
  createdAt?: string;
};

export type PublicSpecification = {
  label: string;
  key: string;
  type: "text" | "number" | "textarea" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
};

export type PublicProductImage = {
  filename: string;
  path?: string;
  url: string;
};

export type PublicCategoryProduct = {
  _id: string;
  categoryId: PublicCategory;
  price: number;
  specifications: PublicSpecification[];
  images: PublicProductImage[];
  status: "active";
};

export const getPublicCategories = () =>
  api.get<{ success: boolean; count: number; categories: PublicCategory[] }>("/public/categories");

export const getPublicCategoryProduct = (slug: string) =>
  api.get<{ success: boolean; category: PublicCategory; product: PublicCategoryProduct }>(
    `/public/category-products/${encodeURIComponent(slug)}`,
  );
