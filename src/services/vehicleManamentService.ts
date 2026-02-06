import { authApiClient } from "../lib/api_client/api_client";
import { buildApiUrl } from "../lib/api_client/config";

// ====== Make & Model API types ======
export interface MakeModel {
  id: number;
  model_id: string;
  make_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Make {
  id: number;
  make_id: string;
  name: string;
  img: string | null;
  created_at: string;
  updated_at: string;
  model: MakeModel[];
}

export interface GetMakeModelsResponse {
  status: boolean;
  data: Make[];
}

export interface AddMakeResponse {
  status: boolean;
  message: string;
  data: {
    make_id: string;
    name: string;
    img: string;
    id: number;
  };
}

export interface UpdateMakeResponse {
  status: boolean;
  message: string;
}

export interface DeleteMakeResponse {
  status: boolean;
  message: string;
}

export interface AddModelResponse {
  status: boolean;
  message: string;
  data: {
    make_id: string;
    model_id: string;
    name: string;
    created_at: string;
    updated_at: string;
    id: number;
  };
}

export interface UpdateModelResponse {
  status: boolean;
  message: string;
}

export interface DeleteModelResponse {
  status: boolean;
  message: string;
}

function getAuthToken(): string | undefined {
  try {
    return localStorage.getItem("authToken") || undefined;
  } catch {
    return undefined;
  }
}

export async function fetchGetMakeModels(): Promise<GetMakeModelsResponse> {
  const endpoint = "public/api/getMakeModels";
  const token = getAuthToken();

  try {
    console.log("[Vehicle] Fetch getMakeModels request", {
      method: "GET",
      url: buildApiUrl(endpoint),
      headers: { Authorization: token ? "Bearer ***" : undefined },
    });
  } catch {}

  const raw = await authApiClient.post<GetMakeModelsResponse>(endpoint, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  try {
    console.log("[Vehicle] Fetch getMakeModels response", raw);
  } catch {}

  return {
    status: Boolean(raw?.status),
    data: raw?.data ?? [],
  };
}

export async function addMake(name: string, img: File | null): Promise<AddMakeResponse> {
  const endpoint = "public/api/addMake";
  const token = getAuthToken();

  const formData = new FormData();
  formData.append("name", name);
  if (img) {
    formData.append("img", img, img.name);
  }

  try {
    console.log("[Vehicle] Add make request", {
      method: "POST",
      url: buildApiUrl(endpoint),
      body: { name, img: img ? "(file)" : null },
      headers: { Authorization: token ? "Bearer ***" : undefined },
    });
  } catch {}

  const raw = await authApiClient.post<AddMakeResponse>(endpoint, formData, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    transformRequest: [(data) => data],
  });

  try {
    console.log("[Vehicle] Add make response", raw);
  } catch {}

  return {
    status: Boolean(raw?.status),
    message: raw?.message ?? "",
    data: raw?.data ?? { make_id: "", name: "", img: "", id: 0 },
  };
}

export async function updateMake(
  make_id: string,
  name: string,
  img: File | null
): Promise<UpdateMakeResponse> {
  const endpoint = "public/api/updateMake";
  const token = getAuthToken();

  const formData = new FormData();
  formData.append("make_id", make_id);
  formData.append("name", name);
  if (img) {
    formData.append("img", img, img.name);
  }

  try {
    console.log("[Vehicle] Update make request", {
      method: "POST",
      url: buildApiUrl(endpoint),
      body: { make_id, name, img: img ? "(file)" : null },
      headers: { Authorization: token ? "Bearer ***" : undefined },
    });
  } catch {}

  const raw = await authApiClient.post<UpdateMakeResponse>(endpoint, formData, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    transformRequest: [(data) => data],
  });

  try {
    console.log("[Vehicle] Update make response", raw);
  } catch {}

  return {
    status: Boolean(raw?.status),
    message: raw?.message ?? "",
  };
}

export async function deleteMake(make_id: string): Promise<DeleteMakeResponse> {
  const endpoint = "public/api/deleteMake";
  const token = getAuthToken();
  const body = { make_id };

  try {
    console.log("[Vehicle] Delete make request", {
      method: "POST",
      url: buildApiUrl(endpoint),
      body,
      headers: { Authorization: token ? "Bearer ***" : undefined },
    });
  } catch {}

  const raw = await authApiClient.post<DeleteMakeResponse>(endpoint, body, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  try {
    console.log("[Vehicle] Delete make response", raw);
  } catch {}

  return {
    status: Boolean(raw?.status),
    message: raw?.message ?? "",
  };
}

export async function deleteModel(model_id: string): Promise<DeleteModelResponse> {
  const endpoint = "public/api/deleteModel";
  const token = getAuthToken();
  const body = { model_id };

  try {
    console.log("[Vehicle] Delete model request", {
      method: "POST",
      url: buildApiUrl(endpoint),
      body,
      headers: { Authorization: token ? "Bearer ***" : undefined },
    });
  } catch {}

  const raw = await authApiClient.post<DeleteModelResponse>(endpoint, body, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  try {
    console.log("[Vehicle] Delete model response", raw);
  } catch {}

  return {
    status: Boolean(raw?.status),
    message: raw?.message ?? "",
  };
}

export async function addModel(make_id: string, name: string): Promise<AddModelResponse> {
  const endpoint = "public/api/addModel";
  const token = getAuthToken();
  const body = { make_id, name };

  try {
    console.log("[Vehicle] Add model request", {
      method: "POST",
      url: buildApiUrl(endpoint),
      body,
      headers: { Authorization: token ? "Bearer ***" : undefined },
    });
  } catch {}

  const raw = await authApiClient.post<AddModelResponse>(endpoint, body, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  try {
    console.log("[Vehicle] Add model response", raw);
  } catch {}

  return {
    status: Boolean(raw?.status),
    message: raw?.message ?? "",
    data: raw?.data ?? {
      make_id: "",
      model_id: "",
      name: "",
      created_at: "",
      updated_at: "",
      id: 0,
    },
  };
}

export async function updateModel(make_id: string, model_id: string, name: string): Promise<UpdateModelResponse> {
  const endpoint = "public/api/updateModel";
  const token = getAuthToken();
  const body = { make_id, model_id, name };

  try {
    console.log("[Vehicle] Update model request", {
      method: "POST",
      url: buildApiUrl(endpoint),
      body,
      headers: { Authorization: token ? "Bearer ***" : undefined },
    });
  } catch {}

  const raw = await authApiClient.post<UpdateModelResponse>(endpoint, body, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  try {
    console.log("[Vehicle] Update model response", raw);
  } catch {}

  return {
    status: Boolean(raw?.status),
    message: raw?.message ?? "",
  };
}
