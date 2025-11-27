'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Overview', href: '/docs/upload-widget/overview' },
      { title: 'Quick Start', href: '/docs/upload-widget/quick-start' },
      { title: 'Installation', href: '/docs/upload-widget/installation' },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { title: 'Configuration', href: '/docs/upload-widget/configuration' },
      { title: 'API Reference', href: '/docs/upload-widget/api-reference' },
      { title: 'Events & Callbacks', href: '/docs/upload-widget/events-callbacks' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { title: 'File Validation', href: '/docs/upload-widget/file-validation' },
      { title: 'Backend Integration', href: '/docs/upload-widget/backend-integration' },
      { title: 'Customization', href: '/docs/upload-widget/customization' },
    ],
  },
  {
    title: 'Development',
    items: [
      { title: 'Testing & Development', href: '/docs/upload-widget/testing-development' },
      { title: 'Deployment', href: '/docs/upload-widget/deployment' },
      { title: 'Troubleshooting', href: '/docs/upload-widget/troubleshooting' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { title: 'Examples', href: '/docs/upload-widget/examples' },
      { title: 'Security', href: '/docs/upload-widget/security' },
      { title: 'Performance', href: '/docs/upload-widget/performance' },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-64 h-screen bg-white border-r border-gray-200 p-6 overflow-y-auto sticky top-0">
      <div className="mb-8">
        <Link href="/docs/upload-widget/overview" className="text-lg font-semibold text-gray-900">
          Upload Widget Docs
        </Link>
      </div>
      
      <div className="space-y-8">
        {navigation.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block text-sm py-1.5 px-2 rounded-md transition-colors',
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}