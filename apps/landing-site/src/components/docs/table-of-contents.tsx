'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .filter((heading) => heading.id)
      .map((heading) => ({
        id: heading.id,
        title: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1)),
      }));

    setToc(headings);

    // Set up intersection observer for active heading detection
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -80% 0px',
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  if (toc.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className={cn('w-64 h-screen sticky top-0 p-6', className)}>
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">On this page</h4>
        <nav>
          <ul className="space-y-2">
            {toc.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.id)}
                  className={cn(
                    'block text-left text-sm py-1 transition-colors w-full',
                    item.level === 2 && 'pl-0',
                    item.level === 3 && 'pl-4',
                    item.level === 4 && 'pl-8',
                    item.level >= 5 && 'pl-12',
                    activeId === item.id
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}