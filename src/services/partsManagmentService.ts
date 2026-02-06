import { authApiClient } from "../lib/api_client/api_client";
import { buildApiUrl } from "../lib/api_client/config";

// ====== Part Categories API types ======
export interface PartName {
  id: number;
  cat_id: string;
  part_name_id: string;
  name: string;
  img: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartCategory {
  id: number;
  cat_id: string;
  name: string;
  img: string | null;
  created_at: string;
  updated_at: string;
  part_name: PartName[];
}

export interface GetPartCategoriesResponse {
  status: boolean;
  message: string;
  data: PartCategory[];
}

export interface AddPartCategoryData {
  cat_id: string;
  name: string;
  updated_at: string;
  created_at: string;
  id: number;
}

export interface AddPartCategoryResponse {
  status: boolean;
  message: string;
  data: AddPartCategoryData;
}

function getAuthToken(): string | undefined {
  try {
    return localStorage.getItem("authToken") || undefined;
  } catch {
    return undefined;
  }
}

export async function fetchGetPartCategories(): Promise<GetPartCategoriesResponse> {
  const endpoint = "public/api/getPartCategories";
  const token = getAuthToken();



  const raw = await authApiClient.post<GetPartCategoriesResponse>(endpoint, {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  try {
    console.log("[Parts] Fetch getPartCategories response", raw);
  } catch {}

  return {
    status: Boolean(raw?.status),
    message: raw?.message ?? "",
    data: Array.isArray(raw?.data) ? raw.data : [],
  };
}

export async function addPartCategory(
  name: string,
  img: File | null
): Promise<AddPartCategoryResponse> {
  const endpoint = "public/api/addPartCategory";
  const token = getAuthToken();

  const formData = new FormData();
  formData.append("name", name.trim());
  if (img) {
    formData.append("img", img);
  } else {
    formData.append("img", "");
  }

  const raw = await authApiClient.post<AddPartCategoryResponse>(endpoint, formData, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return {
    status: Boolean(raw?.status),
    message: raw?.message ?? "",
    data: raw?.data ?? (raw as any)?.data,
  };
}

export interface UpdatePartCategoryResponse {
  status: boolean;
  message: string;
  data?: unknown;
}

export async function updatePartCategory(
  cat_id: string,
  name: string,
  img: File | null
): Promise<UpdatePartCategoryResponse> {
  const endpoint = "public/api/updatePartCategory";
  const token = getAuthToken();

  const formData = new FormData();
  formData.append("cat_id", cat_id);
  formData.append("name", name.trim());
  if (img) {
    formData.append("img", img);
  } else {
    formData.append("img", "");
  }

  const raw = await authApiClient.post<UpdatePartCategoryResponse>(endpoint, formData, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return {
    status: Boolean(raw?.status),
    message: raw?.message ?? "",
    data: (raw as any)?.data,
  };
}

export interface DeletePartCategoryResponse {
  status: boolean;
  message: string;
  data?: unknown;
}

export async function deletePartCategory(cat_id: string): Promise<DeletePartCategoryResponse> {
  const endpoint = "public/api/deletePartCategory";
  const token = getAuthToken();

  const raw = await authApiClient.post<DeletePartCategoryResponse>(
    endpoint,
    { cat_id },
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
  );

  return {
    status: Boolean(raw?.status),
    message: raw?.message ?? "",
    data: (raw as any)?.data,
  };
}

export interface AddPartNameData {
  part_name_id: string;
  cat_id: string;
  name: string;
  img: string | null;
  created_at: string;
  updated_at: string;
  id: number;
}

export interface AddPartNameResponse {
  status: boolean;
  message: string;
  data: AddPartNameData;
}

export async function addPartName(
  cat_id: string,
  name: string
): Promise<AddPartNameResponse> {
  const endpoint = "public/api/addPartName";
  const token = getAuthToken();

  const raw = await authApiClient.post<AddPartNameResponse>(
    endpoint,
    { cat_id, name: name.trim() },
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
  );

  return {
    status: Boolean(raw?.status),
    message: raw?.message ?? "",
    data: raw?.data ?? (raw as any)?.data,
  };
}
