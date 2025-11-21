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

export function useMoveFiles(
  options?: Omit<UseMutationOptions<any, Error, { sourceIds: string[]; destinationFolderId: string; destinationPath?: string }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceIds, destinationFolderId, destinationPath }) => 
      filesApi.moveFiles(sourceIds, destinationFolderId, destinationPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEYS.lists() });
    },
    ...options,
  });
}

export function useCopyFiles(
  options?: Omit<UseMutationOptions<any, Error, { sourceIds: string[]; destinationFolderId: string; destinationPath?: string }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceIds, destinationFolderId, destinationPath }) => 
      filesApi.copyFiles(sourceIds, destinationFolderId, destinationPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEYS.lists() });
    },
    ...options,
  });
}

export function useDeleteFiles(
  options?: Omit<UseMutationOptions<any, Error, { ids: string[] }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids }) => filesApi.permanentDeleteFiles(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEYS.lists() });
    },
    ...options,
  });
}

export function usePermanentDeleteFiles(
  options?: Omit<UseMutationOptions<any, Error, { ids: string[] }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids }) => filesApi.permanentDeleteFiles(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEYS.lists() });
    },
    ...options,
  });
}

export function useCreateSharingUrl(
  options?: Omit<UseMutationOptions<any, Error, { fileId: string; expiresAt?: Date; durationSeconds?: number }>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: ({ fileId, expiresAt, durationSeconds }) => 
      filesApi.createSharingUrl(fileId, expiresAt, durationSeconds),
    ...options,
  });
}

export function useRenameFile(
  options?: Omit<UseMutationOptions<any, Error, { id: string; newName: string }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newName }) => filesApi.renameFile(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEYS.lists() });
    },
    ...options,
  });
}

export function useChangeVisibility(
  options?: Omit<UseMutationOptions<any, Error, { id: string[]; isPublic: boolean }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPublic }) => filesApi.changeVisibility(id, isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEYS.lists() });
    },
    ...options,
  });
}