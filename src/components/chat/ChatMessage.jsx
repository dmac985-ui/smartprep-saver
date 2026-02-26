import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Copy, Zap, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FunctionDisplay = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || 'Function';
  const status = toolCall?.status || 'pending';
  const results = toolCall?.results;

  const parsedResults = (() => {
    if (!results) return null;
    try {
      return typeof results === 'string' ? JSON.parse(results) : results;
    } catch {
      return results;
    }
  })();

  const isError = results && (
    (typeof results === 'string' && /error|failed/i.test(results)) ||
    (parsedResults?.success === false)
  );

  const statusConfig = {
    pending: { icon: Clock, color: 'text-slate-400', text: 'Pending' },
    running: { icon: Loader2, color: 'text-emerald-500', text: 'Working...', spin: true },
    in_progress: { icon: Loader2, color: 'text-emerald-500', text: 'Working...', spin: true },
    completed: isError
      ? { icon: AlertCircle, color: 'text-red-500', text: 'Failed' }
      : { icon: CheckCircle2, color: 'text-emerald-600', text: 'Done' },
    success: { icon: CheckCircle2, color: 'text-emerald-600', text: 'Done' },
    failed: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' },
    error: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' }
  }[status] || { icon: Zap, color: 'text-slate-500', text: '' };

  const Icon = statusConfig.icon;
  const formattedName = name.split('.').pop().replace(/_/g, ' ');

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
          "hover:bg-slate-50 bg-white border-slate-200",
          expanded && "bg-slate-50 border-slate-300"
        )}
      >
        <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
        <span className="text-slate-700 capitalize">{formattedName}</span>
        {statusConfig.text && (
          <span className={cn("text-slate-500", isError && "text-red-600")}>
            • {statusConfig.text}
          </span>
        )}
        {!statusConfig.spin && (toolCall.arguments_string || results) && (
          <ChevronRight className={cn("h-3 w-3 text-slate-400 transition-transform ml-auto", expanded && "rotate-90")} />
        )}
      </button>

      {expanded && !statusConfig.spin && parsedResults && (
        <div className="mt-1.5 ml-3 pl-3 border-l-2 border-slate-200">
          <pre className="bg-slate-50 rounded-md p-2 text-xs text-slate-600 whitespace-pre-wrap max-h-48 overflow-auto">
            {typeof parsedResults === 'object' ? JSON.stringify(parsedResults, null, 2) : parsedResults}
          </pre>
        </div>
      )}
    </div>
  );
};

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mt-0.5 shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
        {message.content && (
          <div className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
              : "bg-white border border-slate-200 shadow-sm"
          )}>
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown
                className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 shadow-sm bg-white">
                      <table className="min-w-full border-collapse">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gradient-to-r from-emerald-500 to-teal-600 sticky top-0 z-10">
                      {children}
                    </thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left font-bold text-white text-sm tracking-wide whitespace-nowrap">
                      {children}
                    </th>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-slate-100">
                      {children}
                    </tbody>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3.5 text-slate-700 text-sm align-top leading-relaxed">
                      {children}
                    </td>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-emerald-50/50 transition-colors even:bg-slate-50/50">
                      {children}
                    </tr>
                  ),
                  strong: ({ children }) => <strong className="text-emerald-600 font-semibold">{children}</strong>,
                  code: ({ inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="relative group/code">
                        <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto my-2">
                          <code className={className} {...props}>{children}</code>
                        </pre>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/code:opacity-100 bg-slate-800 hover:bg-slate-700"
                          onClick={() => {
                            navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                            toast.success('Copied');
                          }}
                        >
                          <Copy className="h-3 w-3 text-slate-400" />
                        </Button>
                      </div>
                    ) : (
                      <code className="px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs">
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                  h1: ({ children }) => <h1 className="text-lg font-bold text-slate-800 my-3">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold text-slate-800 my-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-800 my-2">{children}</h3>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}

        {message?.tool_calls && Array.isArray(message.tool_calls) && message.tool_calls.length > 0 && (
          <div className="space-y-1 mt-1">
            {message.tool_calls.map((toolCall, idx) => (
              <FunctionDisplay key={idx} toolCall={toolCall || {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}