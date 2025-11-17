import { useMediaLibraryStore } from "@/stores/media-library.store";
import { ChevronRightIcon, HomeIcon } from "lucide-react";
import { FileSearch } from "./search";
import { cn } from "@/lib/utils";

interface MediaLibraryBreadcrumbsProps
  extends React.HTMLAttributes<HTMLElement> {}
export function MediaLibraryBreadcrumbs(props: MediaLibraryBreadcrumbsProps) {
  const { className, ...rest } = props;
  const { getBreadcrumbs, navigateToFolder } = useMediaLibraryStore();
  const breadcrumbs = getBreadcrumbs();

  return (
    <nav
      className={cn("flex items-center justify-between", className)}
      {...rest}
    >
      <div className="flex items-center space-x-1 text-sm text-gray-500">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center">
            {index > 0 && <ChevronRightIcon className="w-4 h-4 mx-1" />}
            <button
              onClick={() => navigateToFolder(crumb.path)}
              className={`flex items-center px-2 py-1 rounded hover:bg-gray-100 ${
                index === breadcrumbs.length - 1
                  ? "text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {index === 0 && <HomeIcon className="w-4 h-4 mr-1" />}
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      <FileSearch />
    </nav>
  );
}
