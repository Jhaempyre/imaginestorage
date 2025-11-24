import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { filesApi, type GetFilesParams, type GetFilesResponse, type GetImageFilesResponse } from './api';

export const FILES_QUERY_KEYS = {
  all: ['files'] as const,
  lists: () => [...FILES_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetFilesParams) => [...FILES_QUERY_KEYS.lists(), params] as const,
  details: () => [...FILES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FILES_QUERY_KEYS.details(), id] as const,
};

export function useGetFiles(
  params: GetFilesParams,
  options?: Omit<UseQueryOptions<GetFilesResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: FILES_QUERY_KEYS.list(params),
    queryFn: () => filesApi.getFiles(params),
    ...options,
  });
}

export function useGetFileById(
  fileId: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: FILES_QUERY_KEYS.detail(fileId),
    queryFn: () => filesApi.getFileById(fileId),
    enabled: !!fileId,
    ...options,
  });
}

export function useGetFileDetails(
  fileId: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: FILES_QUERY_KEYS.detail(fileId!),
    queryFn: () => filesApi.getFileDetails(fileId!),
    enabled: !!fileId,
    ...options,
  });
}

export function useGetImageFiles(
  options?: Omit<UseQueryOptions<GetImageFilesResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...FILES_QUERY_KEYS.all, 'images'] as const,
    queryFn: () => filesApi.getImageFiles(),
    ...options,
  });
}

export function useGetVideoFiles(
  options?: Omit<UseQueryOptions<GetImageFilesResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...FILES_QUERY_KEYS.all, 'videos'] as const,
    queryFn: () => filesApi.getVideoFiles(),
    ...options,
  });
}

export function useGetDocumentFiles(
  options?: Omit<UseQueryOptions<GetImageFilesResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...FILES_QUERY_KEYS.all, 'documents'] as const,
    queryFn: () => filesApi.getDocumentFiles(),
    ...options,
  });
}