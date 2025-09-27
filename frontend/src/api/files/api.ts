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

  async getFileById(fileId: string) {
    const response = await axiosClient.get(`/files/${fileId}`);
    return response.data;
  },
};