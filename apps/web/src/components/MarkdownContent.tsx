import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "max-w-none text-sm leading-7 text-muted-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-5 mb-3 text-xl font-semibold tracking-[-0.02em] text-foreground first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-3 text-lg font-semibold tracking-[-0.02em] text-foreground first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-2 text-base font-semibold text-foreground first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-3 mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1.5 pl-5 marker:text-[var(--primary)]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1.5 pl-5 marker:text-[var(--primary)]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          code: ({ className: codeClassName, children }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code className="rounded-md bg-white/8 px-1.5 py-0.5 font-mono text-[0.92em] text-[var(--primary)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                  {children}
                </code>
              );
            }
            return (
              <code className="block font-mono text-[13px] leading-6 text-slate-100">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="surface-inset my-3 overflow-x-auto p-4">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(79,70,229,0.16),rgba(8,13,28,0.96))] px-4 py-3 italic text-slate-100">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] underline decoration-[rgba(195,192,255,0.45)] underline-offset-4 transition-colors hover:text-foreground"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-4 border-white/10" />,
          table: ({ children }) => (
            <div className="surface-inset my-3 overflow-x-auto p-0">
              <table className="min-w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/6">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-white/8 last:border-b-0">{children}</tr>,
          th: ({ children }) => (
            <th className="border-r border-white/8 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-r border-white/8 px-3 py-2 text-sm text-slate-100 last:border-r-0">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
