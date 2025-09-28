import { create } from 'zustand';

export interface MediaItem {
  _id?: string;
  type: 'file' | 'folder';
  name: string;
  fullPath: string;
  originalName?: string;
  previewUrl?: string;
}

export interface MediaLibraryState {
  currentPath: string;
  selectedItems: string[];
  viewMode: 'grid' | 'list';
  sortBy: 'originalName' | 'createdAt' | 'fileSize';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
  isUploading: boolean;
  uploadProgress: number;
}

export interface MediaLibraryActions {
  setCurrentPath: (path: string) => void;
  navigateToFolder: (folderPath: string) => void;
  navigateUp: () => void;
  navigateToRoot: () => void;
  toggleItemSelection: (itemPath: string) => void;
  selectAllItems: (items: MediaItem[]) => void;
  clearSelection: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sortBy: 'originalName' | 'createdAt' | 'fileSize') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setSearchQuery: (query: string) => void;
  setUploadStatus: (isUploading: boolean, progress?: number) => void;
  getBreadcrumbs: () => Array<{ name: string; path: string }>;
}

export const useMediaLibraryStore = create<MediaLibraryState & MediaLibraryActions>((set, get) => ({
  // State
  currentPath: '',
  selectedItems: [],
  viewMode: 'grid',
  sortBy: 'originalName',
  sortOrder: 'asc',
  searchQuery: '',
  isUploading: false,
  uploadProgress: 0,

  // Actions
  setCurrentPath: (path: string) => {
    set({ currentPath: path, selectedItems: [] });
  },

  navigateToFolder: (folderPath: string) => {
    set({ currentPath: folderPath, selectedItems: [] });
  },

  navigateUp: () => {
    const { currentPath } = get();
    if (!currentPath) return;
    
    const segments = currentPath.split('/').filter(Boolean);
    segments.pop();
    const newPath = segments.length > 0 ? segments.join('/') + '/' : '';
    set({ currentPath: newPath, selectedItems: [] });
  },

  navigateToRoot: () => {
    set({ currentPath: '', selectedItems: [] });
  },

  toggleItemSelection: (itemPath: string) => {
    const { selectedItems } = get();
    const isSelected = selectedItems.includes(itemPath);
    
    if (isSelected) {
      set({ selectedItems: selectedItems.filter(path => path !== itemPath) });
    } else {
      set({ selectedItems: [...selectedItems, itemPath] });
    }
  },

  selectAllItems: (items: MediaItem[]) => {
    const allPaths = items.map(item => item.fullPath);
    set({ selectedItems: allPaths });
  },

  clearSelection: () => {
    set({ selectedItems: [] });
  },

  setViewMode: (mode: 'grid' | 'list') => {
    set({ viewMode: mode });
  },

  setSortBy: (sortBy: 'originalName' | 'createdAt' | 'fileSize') => {
    set({ sortBy });
  },

  setSortOrder: (order: 'asc' | 'desc') => {
    set({ sortOrder: order });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setUploadStatus: (isUploading: boolean, progress: number = 0) => {
    set({ isUploading, uploadProgress: progress });
  },

  getBreadcrumbs: () => {
    const { currentPath } = get();
    if (!currentPath) return [{ name: 'Root', path: '' }];

    const segments = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Root', path: '' }];

    let accumulatedPath = '';
    segments.forEach((segment) => {
      accumulatedPath += segment + '/';
      breadcrumbs.push({
        name: segment,
        path: accumulatedPath
      });
    });

    return breadcrumbs;
  },
}));