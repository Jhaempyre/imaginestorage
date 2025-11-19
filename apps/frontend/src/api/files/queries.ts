import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { filesApi, type GetFilesParams, type GetFilesResponse } from './api';

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