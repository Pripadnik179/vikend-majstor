import { File } from 'expo-file-system';
import { fetch } from 'expo/fetch';
import { getApiUrl } from '@/lib/query-client';
import { getAuthTokenSync } from '@/lib/authToken';

function getAuthHeaders(): Record<string, string> {
  const token = getAuthTokenSync();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}

export async function uploadFileToStorage(
  file: File,
  getUploadUrlEndpoint: string = '/api/objects/upload',
): Promise<string> {
  const apiUrl = getApiUrl();
  const uploadUrlEndpoint = new URL(getUploadUrlEndpoint, apiUrl).toString();
  const presignedUrlResponse = await fetch(uploadUrlEndpoint, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  if (!presignedUrlResponse.ok) {
    throw new Error(
      `Failed to get presigned URL with status: ${presignedUrlResponse.status}`
    );
  }

  const { uploadURL } = await presignedUrlResponse.json();
  if (!uploadURL) {
    throw new Error('No uploadURL returned from server');
  }
  
  const uploadResponse = await fetch(uploadURL.toString(), {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `Upload to object storage failed with status: ${uploadResponse.status}`
    );
  }

  return uploadURL;
}

export async function uploadFileToStorageWeb(
  file: globalThis.File,
  getUploadUrlEndpoint: string = '/api/objects/upload',
): Promise<string> {
  const apiUrl = getApiUrl();
  const uploadUrlEndpoint = new URL(getUploadUrlEndpoint, apiUrl).toString();
  
  const presignedUrlResponse = await window.fetch(uploadUrlEndpoint, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  if (!presignedUrlResponse.ok) {
    throw new Error(
      `Failed to get presigned URL with status: ${presignedUrlResponse.status}`
    );
  }

  const { uploadURL } = await presignedUrlResponse.json();
  if (!uploadURL) {
    throw new Error('No uploadURL returned from server');
  }
  
  const uploadResponse = await window.fetch(uploadURL.toString(), {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `Upload to object storage failed with status: ${uploadResponse.status}`
    );
  }

  return uploadURL;
}

export async function finalizeUpload(
  uploadURL: string,
  finalizeEndpoint: string = '/api/objects/finalize',
): Promise<string> {
  const apiUrl = getApiUrl();
  const endpoint = new URL(finalizeEndpoint, apiUrl).toString();
  
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ uploadURL }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to finalize upload: ${response.status}`);
  }

  const { objectPath } = await response.json();
  return objectPath;
}
