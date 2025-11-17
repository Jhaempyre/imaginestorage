import { FILES_QUERY_KEYS } from "@/api/files/queries";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { useGetFilesCommon } from "../utils";

export function Refresh() {
  const queryClient = useQueryClient();
  const getFilesState = useGetFilesCommon();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEYS.lists() });
  };
  return (
    <Button
      variant="outline"
      onClick={handleRefresh}
      className="flex items-center space-x-2"
      disabled={getFilesState?.isFetching}
    >
      {getFilesState?.isFetching ? (
        <>
          <RefreshCwIcon className="animate-spin" />
          <span>Refresh</span>
        </>
      ) : (
        <>
          <RefreshCwIcon className="w-4 h-4" />
          <span>Refresh</span>
        </>
      )}
    </Button>
  );
}
