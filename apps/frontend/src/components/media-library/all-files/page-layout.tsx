import React from "react";
import { Card } from "../../ui/card";

interface PageLayoutProps extends React.PropsWithChildren {}

export function PageLayout(props: PageLayoutProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      {/* <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">All Files</h1>
          </div>
        </div>
      </div> */}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full border-0 shadow-sm p-0">{props.children}</Card>
      </div>
    </div>
  );
}
