import { useGetFiles } from "@/api/files";
import { useMediaLibraryStore } from "@/stores/media-library.store";

export const useGetFilesCommon = () => {
  const { currentPath, searchQuery, sortBy, sortOrder } =
    useMediaLibraryStore();

  return useGetFiles({
    prefix: currentPath,
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
  });
};
