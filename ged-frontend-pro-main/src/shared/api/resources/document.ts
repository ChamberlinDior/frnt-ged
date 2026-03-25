import { apiClient, apiUploadClient, toAbsoluteBackendUrl } from "@/shared/api/client";

export type DocumentStatus = "DRAFT" | "VALIDATED" | "ARCHIVED";

export type DocumentRequest = {
  title: string;
  referenceCode?: string;
  description?: string | null;
  status: DocumentStatus;
  documentDate: string;
  filePath?: string | null;
  externalUrl?: string | null;
  externalDocument?: boolean;
  active?: boolean;
  categoryId: number;
  departmentId: number;
};

export type DocumentUploadRequest = {
  title: string;
  referenceCode?: string;
  description?: string | null;
  status: DocumentStatus;
  documentDate: string;
  active?: boolean;
  categoryId: number;
  departmentId: number;
  file: File;
};

export type DocumentItem = {
  id: number;
  title: string;
  referenceCode: string;
  description?: string | null;
  status: DocumentStatus;
  documentDate: string;
  active: boolean;
  createdAt?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;

  categoryId?: number;
  categoryName?: string | null;
  departmentId?: number;
  departmentName?: string | null;

  openUrl?: string | null;
  downloadUrl?: string | null;
  externalUrl?: string | null;
  filePath?: string | null;
  originalFileName?: string | null;
  externalDocument?: boolean;
  storageType?: string | null;
};

function isAbsoluteHttpUrl(value?: string | null): boolean {
  return !!value && /^https?:\/\//i.test(value);
}

function normalizeDocument(item: DocumentItem): DocumentItem {
  return {
    ...item,
    openUrl: item.openUrl ? toAbsoluteBackendUrl(item.openUrl) : item.openUrl,
    downloadUrl: item.downloadUrl ? toAbsoluteBackendUrl(item.downloadUrl) : item.downloadUrl,
    externalUrl: isAbsoluteHttpUrl(item.externalUrl)
      ? item.externalUrl
      : item.externalUrl
      ? toAbsoluteBackendUrl(item.externalUrl)
      : item.externalUrl,
    filePath:
      item.storageType === "LOCAL_DISK"
        ? item.filePath
        : item.filePath && !isAbsoluteHttpUrl(item.filePath)
        ? toAbsoluteBackendUrl(item.filePath)
        : item.filePath,
  };
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const response = await apiClient.get<DocumentItem[]>("/documents");
  return response.data.map(normalizeDocument);
}

export async function fetchDocumentsActive(): Promise<DocumentItem[]> {
  const response = await apiClient.get<DocumentItem[]>("/documents/active");
  return response.data.map(normalizeDocument);
}

export async function fetchDocumentsByDepartment(
  departmentId: number,
  options?: { categoryId?: number; activeOnly?: boolean }
): Promise<DocumentItem[]> {
  const response = await apiClient.get<DocumentItem[]>(`/departments/${departmentId}/documents`, {
    params: {
      categoryId: options?.categoryId,
      activeOnly: options?.activeOnly ?? false,
    },
  });
  return response.data.map(normalizeDocument);
}

export async function fetchDocumentsByStatus(status: DocumentStatus): Promise<DocumentItem[]> {
  const response = await apiClient.get<DocumentItem[]>(`/documents/status/${status}`);
  return response.data.map(normalizeDocument);
}

export async function searchDocuments(keyword: string): Promise<DocumentItem[]> {
  const response = await apiClient.get<DocumentItem[]>("/documents/search", {
    params: { keyword },
  });
  return response.data.map(normalizeDocument);
}

export async function fetchDocumentById(id: number): Promise<DocumentItem> {
  const response = await apiClient.get<DocumentItem>(`/documents/${id}`);
  return normalizeDocument(response.data);
}

export async function fetchNextReferenceCode(): Promise<string> {
  const response = await apiClient.get<{ referenceCode: string }>("/documents/next-reference");
  return response.data.referenceCode;
}

export async function createDocument(data: DocumentRequest): Promise<DocumentItem> {
  const payload = {
    title: data.title,
    description: data.description ?? null,
    status: data.status,
    documentDate: data.documentDate,
    filePath: data.filePath ?? null,
    externalUrl: data.externalUrl ?? null,
    externalDocument: data.externalDocument ?? false,
    active: data.active ?? true,
    categoryId: data.categoryId,
    departmentId: data.departmentId,
  };

  const response = await apiClient.post<DocumentItem>("/documents", payload);
  return normalizeDocument(response.data);
}

export async function createDocumentExternalLink(data: DocumentRequest): Promise<DocumentItem> {
  const payload = {
    title: data.title,
    description: data.description ?? null,
    status: data.status,
    documentDate: data.documentDate,
    externalUrl: data.externalUrl ?? null,
    externalDocument: true,
    active: data.active ?? true,
    categoryId: data.categoryId,
    departmentId: data.departmentId,
  };

  const response = await apiClient.post<DocumentItem>("/documents/link", payload);
  return normalizeDocument(response.data);
}

export async function createDocumentWithUpload(data: DocumentUploadRequest): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  formData.append("status", data.status);
  formData.append("documentDate", data.documentDate);
  formData.append("active", String(data.active ?? true));
  formData.append("categoryId", String(data.categoryId));
  formData.append("departmentId", String(data.departmentId));
  formData.append("file", data.file);

  const response = await apiUploadClient.post<DocumentItem>("/documents/upload", formData);
  return normalizeDocument(response.data);
}

export async function updateDocument(id: number, data: DocumentRequest): Promise<DocumentItem> {
  const payload = {
    title: data.title,
    description: data.description ?? null,
    status: data.status,
    documentDate: data.documentDate,
    filePath: data.filePath ?? null,
    externalUrl: data.externalUrl ?? null,
    externalDocument: data.externalDocument ?? false,
    active: data.active ?? true,
    categoryId: data.categoryId,
    departmentId: data.departmentId,
  };

  const response = await apiClient.put<DocumentItem>(`/documents/${id}`, payload);
  return normalizeDocument(response.data);
}

export async function updateDocumentExternalLink(id: number, data: DocumentRequest): Promise<DocumentItem> {
  const payload = {
    title: data.title,
    description: data.description ?? null,
    status: data.status,
    documentDate: data.documentDate,
    externalUrl: data.externalUrl ?? null,
    externalDocument: true,
    active: data.active ?? true,
    categoryId: data.categoryId,
    departmentId: data.departmentId,
  };

  const response = await apiClient.put<DocumentItem>(`/documents/${id}/link`, payload);
  return normalizeDocument(response.data);
}

export async function updateDocumentWithUpload(
  id: number,
  data: DocumentUploadRequest
): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  formData.append("status", data.status);
  formData.append("documentDate", data.documentDate);
  formData.append("active", String(data.active ?? true));
  formData.append("categoryId", String(data.categoryId));
  formData.append("departmentId", String(data.departmentId));
  formData.append("file", data.file);

  const response = await apiUploadClient.put<DocumentItem>(`/documents/${id}/upload`, formData);
  return normalizeDocument(response.data);
}

export async function deleteDocument(id: number): Promise<void> {
  await apiClient.delete(`/documents/${id}`);
}