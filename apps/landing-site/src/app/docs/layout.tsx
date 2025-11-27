import { DocsSidebar } from '@/components/docs/sidebar';
import { TableOfContents } from '@/components/docs/table-of-contents';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <DocsSidebar />
      
      {/* Main content */}
      <main className="flex-1 max-w-4xl">
        <div className="px-8 py-6">
          {children}
        </div>
      </main>
      
      {/* Table of Contents */}
      <TableOfContents />
    </div>
  );
}