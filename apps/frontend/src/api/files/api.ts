import axiosClient from '../client/axios-client';
import type { MediaItem } from '@/stores/media-library.store';

export interface GetFilesParams {
  search?: string;
  mimeType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  prefix?: string;
}

export interface GetFilesResponse {
  success: boolean;
  message: string;
  data: {
    items: MediaItem[];
  };
}

export interface UploadFileResponse {
  success: boolean;
  message: string;
  data: {
    file: any;
  };
}

export interface CreateFolderResponse {
  success: boolean;
  message: string;
  data: {
    fullPath: string;
  };
}

export const filesApi = {
  async getFiles(params: GetFilesParams): Promise<GetFilesResponse> {
    const response = await axiosClient.get<GetFilesResponse>('/files', { params });
    return response.data;
  },

  async uploadFile(file: File, folderPath?: string): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folderPath) {
      formData.append('folderPath', folderPath);
    }

    const response = await axiosClient.post<UploadFileResponse>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async createFolder(fullPath: string) {
    const response = await axiosClient.post<CreateFolderResponse>('/files/create-folder', { fullPath });
    return response.data;
  },

  async getFileById(fileId: string) {
    const response = await axiosClient.get(`/files/${fileId}`);
    return response.data;
  },

  async getFileDetails(fileId: string) {
    const response = await axiosClient.get(`/files/details/${fileId}`);
    return response.data;
  },

  async moveFiles(sourceIds: string[], destinationFolderId: string, destinationPath?: string) {
    const payload: any = { sourceIds };
    
    if (destinationFolderId === 'root') {
      payload.destinationFolderId = 'root';
      payload.destinationPath = destinationPath || '/';
    } else {
      payload.destinationFolderId = destinationFolderId;
    }
    
    const response = await axiosClient.post('/files/move', payload);
    return response.data;
  },

  async copyFiles(sourceIds: string[], destinationFolderId: string, destinationPath?: string) {
    const payload: any = { sourceIds };
    
    if (destinationFolderId === 'root') {
      payload.destinationFolderId = 'root';
      payload.destinationPath = destinationPath || '/';
    } else {
      payload.destinationFolderId = destinationFolderId;
    }
    
    const response = await axiosClient.post('/files/copy', payload);
    return response.data;
  },

  async deleteFiles(ids: string[]) {
    const response = await axiosClient.post('/files/soft-delete', {
      ids,
    });
    return response.data;
  },

  async permanentDeleteFiles(ids: string[]) {
    const response = await axiosClient.post('/files/permanent-delete', {
      ids,
    });
    return response.data;
  },

  async createSharingUrl(fileId: string, expiresAt?: Date, durationSeconds?: number) {
    const payload: any = { fileId };
    
    if (expiresAt) {
      payload.expiresAt = expiresAt;
    } else if (durationSeconds) {
      payload.durationSeconds = durationSeconds;
    }
    
    const response = await axiosClient.post('/files/create-sharing-url', payload);
    return response.data;
  },

  async renameFile(id: string, newName: string) {
    const response = await axiosClient.patch(`/files/rename/${id}`, { id, newName });
    return response.data;
  },

  async changeVisibility(id: string[], isPublic: boolean) {
    const response = await axiosClient.patch(`/files/change-visibility`, { 
      id, 
      isPublic 
    });
    return response.data;
  },
};