import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { filesApi, type CreateFolderResponse, type UploadFileResponse } from './api';
import { FILES_QUERY_KEYS } from './queries';

export function useUploadFile(
  options?: Omit<UseMutationOptions<UploadFileResponse, Error, { file: File; folderPath?: string }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, folderPath }) => filesApi.uploadFile(file, folderPath),
    onSuccess: () => {
      // Invalidate all file lists to refresh the data
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEYS.lists() });
    },
    ...options,
  });
}


export function useCreateFolder(
  options?: Omit<UseMutationOptions<CreateFolderResponse, Error, { fullPath: string }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fullPath }) => filesApi.createFolder(fullPath),
    onSuccess: () => {
      // Invalidate all file lists to refresh the data
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEYS.lists() });
    },
    ...options,
  });
}