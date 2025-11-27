import type { MDXComponents } from 'mdx/types';

// Custom code block component with syntax highlighting
function CodeBlock({ children, className, ...props }: any) {
  const language = className?.replace(/language-/, '');
  
  return (
    <div className="relative group">
      <pre 
        className="bg-slate-900 text-slate-100 p-6 rounded-xl overflow-x-auto mb-6 text-sm leading-relaxed border border-slate-700/50"
        {...props}
      >
        {language && (
          <div className="absolute top-3 right-4 text-xs text-slate-400 font-medium uppercase tracking-wide">
            {language}
          </div>
        )}
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

// Custom inline code component
function InlineCode({ children, ...props }: any) {
  return (
    <code 
      className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-sm font-mono border border-slate-200" 
      {...props}
    >
      {children}
    </code>
  );
}

// Custom table components
function Table({ children, ...props }: any) {
  return (
    <div className="overflow-x-auto mb-6 rounded-lg border border-slate-200">
      <table className="min-w-full" {...props}>
        {children}
      </table>
    </div>
  );
}

function TableHeader({ children, ...props }: any) {
  return (
    <thead className="bg-slate-50" {...props}>
      {children}
    </thead>
  );
}

function TableHeaderCell({ children, ...props }: any) {
  return (
    <th 
      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200" 
      {...props}
    >
      {children}
    </th>
  );
}

function TableCell({ children, ...props }: any) {
  return (
    <td 
      className="px-6 py-4 text-slate-700 border-b border-slate-100 last:border-b-0" 
      {...props}
    >
      {children}
    </td>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Typography hierarchy
    h1: ({ children, ...props }) => (
      <h1 
        className="text-4xl font-bold text-slate-900 mb-8 pb-4 border-b-2 border-slate-200 tracking-tight" 
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 
        className="text-2xl font-bold text-slate-900 mt-12 mb-6 scroll-mt-24" 
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 
        className="text-xl font-semibold text-slate-900 mt-8 mb-4 scroll-mt-24" 
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 
        className="text-lg font-semibold text-slate-900 mt-6 mb-3 scroll-mt-24" 
        {...props}
      >
        {children}
      </h4>
    ),

    // Body text
    p: ({ children, ...props }) => (
      <p 
        className="text-slate-700 mb-6 leading-7 text-base" 
        {...props}
      >
        {children}
      </p>
    ),

    // Lists
    ul: ({ children, ...props }) => (
      <ul 
        className="list-disc list-outside ml-6 mb-6 space-y-2 text-slate-700" 
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol 
        className="list-decimal list-outside ml-6 mb-6 space-y-2 text-slate-700" 
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li 
        className="leading-7" 
        {...props}
      >
        {children}
      </li>
    ),

    // Code blocks and inline code
    pre: ({ children, ...props }) => {
      return (
        <pre 
          className="bg-slate-900 text-slate-100 p-6 rounded-xl overflow-x-auto mb-6 text-sm leading-relaxed border border-slate-700/50"
          {...props}
        >
          {children}
        </pre>
      );
    },
    code: ({ children, className, ...props }) => {
      // Check if it's a code block (has language class) or inline code
      if (className?.startsWith('language-')) {
        return <code className={className} {...props}>{children}</code>;
      }
      return (
        <code 
          className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-sm font-mono border border-slate-200" 
          {...props}
        >
          {children}
        </code>
      );
    },

    // Tables
    table: Table,
    thead: TableHeader,
    th: TableHeaderCell,
    td: TableCell,
    tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
    tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,

    // Links
    a: ({ children, href, ...props }) => (
      <a 
        href={href}
        className="text-blue-600 hover:text-blue-800 underline decoration-blue-200 hover:decoration-blue-400 transition-colors font-medium" 
        {...props}
      >
        {children}
      </a>
    ),

    // Text formatting
    strong: ({ children, ...props }) => (
      <strong 
        className="font-semibold text-slate-900" 
        {...props}
      >
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em 
        className="italic text-slate-700" 
        {...props}
      >
        {children}
      </em>
    ),

    // Blockquotes
    blockquote: ({ children, ...props }) => (
      <blockquote 
        className="border-l-4 border-slate-300 bg-slate-50 pl-6 py-4 mb-6 italic text-slate-700 rounded-r-lg" 
        {...props}
      >
        {children}
      </blockquote>
    ),

    // Horizontal rule
    hr: ({ ...props }) => (
      <hr 
        className="border-slate-200 my-12" 
        {...props}
      />
    ),
    
    ...components,
  };
}