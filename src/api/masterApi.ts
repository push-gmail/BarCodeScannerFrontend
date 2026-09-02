import { api } from "./client";

/* =========================================================
   COMMON TYPES
========================================================= */

export type CategoryStatus =
  | "active"
  | "inactive";

export type CategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  status: CategoryStatus;
};

export type MasterCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: CategoryStatus;
  createdAt?: string;
  updatedAt?: string;
};

/* =========================================================
   SPECIFICATION TYPES
========================================================= */

export type SpecificationType =
  | "text"
  | "number"
  | "textarea"
  | "select";

export type MasterSpecification = {
  label: string;
  key: string;
  type: SpecificationType;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

/* =========================================================
   PRODUCT IMAGE TYPE
========================================================= */

export type MasterProductImage = {
  filename: string;
  path?: string;
  url: string;
  qrData?: string;
};

/* =========================================================
   CATEGORY PRODUCT TYPE
========================================================= */

export type MasterCategoryProduct = {
  _id: string;

  categoryId: MasterCategory;

  price: number;

  specifications: MasterSpecification[];

  images: MasterProductImage[];

  status: CategoryStatus;

  createdAt?: string;
  updatedAt?: string;
};

/* =========================================================
   MASTER LOGIN
========================================================= */

export const loginMaster = (
  email: string,
  password: string,
) =>
  api.post<{
    success: boolean;
    message: string;

    token: string;

    master: {
      _id: string;
      email: string;
      role: "master";
    };
  }>("/master/login", {
    email,
    password,
  });

/* =========================================================
   MASTER DASHBOARD
========================================================= */

export const getMasterDashboard =
  () =>
    api.get<{
      success: boolean;

      data?: {
        categories?: number;
        products?: number;
      };
    }>("/master/dashboard");

/* =========================================================
   CATEGORY CRUD
========================================================= */

/* GET ALL CATEGORIES */

export const getMasterCategories =
  () =>
    api.get<{
      success: boolean;
      count: number;
      categories: MasterCategory[];
    }>("/master/categories");

/* GET SINGLE CATEGORY */

export const getMasterCategory = (
  id: string,
) =>
  api.get<{
    success: boolean;
    category: MasterCategory;
  }>(
    `/master/categories/${id}`,
  );

/* CREATE CATEGORY */

export const createMasterCategory = (
  payload: CategoryPayload,
) =>
  api.post<{
    success: boolean;
    message: string;
    category: MasterCategory;
  }>(
    "/master/categories",
    payload,
  );

/* UPDATE CATEGORY */

export const updateMasterCategory = (
  id: string,
  payload: CategoryPayload,
) =>
  api.put<{
    success: boolean;
    message: string;
    category: MasterCategory;
  }>(
    `/master/categories/${id}`,
    payload,
  );

/* DELETE CATEGORY */

export const deleteMasterCategory = (
  id: string,
) =>
  api.delete<{
    success: boolean;
    message: string;
  }>(
    `/master/categories/${id}`,
  );

/* =========================================================
   CATEGORY PRODUCT CRUD
========================================================= */

/* GET ALL CATEGORY PRODUCTS */

export const getMasterCategoryProducts =
  () =>
    api.get<{
      success: boolean;
      count: number;
      products: MasterCategoryProduct[];
    }>(
      "/master/category-products",
    );

/* GET SINGLE CATEGORY PRODUCT */

export const getMasterCategoryProduct = (
  id: string,
) =>
  api.get<{
    success: boolean;
    product: MasterCategoryProduct;
  }>(
    `/master/category-products/${id}`,
  );

/* =========================================================
   CREATE CATEGORY PRODUCT
========================================================= */

export const createMasterCategoryProduct = (
  formData: FormData,
) =>
  api.post<{
    success: boolean;
    message: string;
    product: MasterCategoryProduct;
  }>(
    "/master/category-products",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    },
  );

/* =========================================================
   UPDATE CATEGORY PRODUCT
========================================================= */

export const updateMasterCategoryProduct = (
  id: string,
  formData: FormData,
) =>
  api.put<{
    success: boolean;
    message: string;
    product: MasterCategoryProduct;
  }>(
    `/master/category-products/${id}`,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    },
  );

/* =========================================================
   DELETE CATEGORY PRODUCT
========================================================= */

export const deleteMasterCategoryProduct = (
  id: string,
) =>
  api.delete<{
    success: boolean;
    message: string;
  }>(
    `/master/category-products/${id}`,
  );