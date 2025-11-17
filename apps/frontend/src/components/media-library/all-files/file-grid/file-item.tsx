import { GridView } from "./views/grid";
import { ListView } from "./views/list";
import type { ViewProps } from "./views/types";

interface FileItemProps extends ViewProps {
  viewMode: "grid" | "list";
}

export default function FileItem(props: FileItemProps) {
  if (props.viewMode === "list") {
    return <ListView {...props} />;
  } else if (props.viewMode === "grid") {
    return <GridView {...props} />;
  }
}
