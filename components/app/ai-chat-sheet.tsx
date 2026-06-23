"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SendHorizonal, Bot, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What issues are urgent?",
  "What's unassigned?",
  "What's overdue?",
  "Who has the most issues assigned?",
];

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceSlug: string;
}

export function AIChatSheet({ open, onClose, workspaceSlug }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/workspaces/${workspaceSlug}/ai/chat`,
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Reset conversation when workspace changes
  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [workspaceSlug, setMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  function submit() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage({ text });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function handleSuggestion(text: string) {
    sendMessage({ text });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={true}
        className="flex flex-col gap-0 p-0 w-[480px] sm:max-w-[480px]"
      >
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-muted-foreground" />
            <SheetTitle>AI Assistant</SheetTitle>
          </div>
        </SheetHeader>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <Bot className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Ask anything about your workspace issues
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const text = m.parts.filter(isTextUIPart).map((p) => p.text).join("");
              if (!text) return null;
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {m.role === "user" ? (
                    <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-primary text-primary-foreground whitespace-pre-wrap">
                      {text}
                    </div>
                  ) : (
                    <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-muted text-foreground">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="mb-1.5 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-1.5 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>,
                          li: ({ children }) => <li>{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          h1: ({ children }) => <h1 className="text-base font-semibold mb-1 mt-2 first:mt-0">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-medium mb-1 mt-2 first:mt-0">{children}</h3>,
                          code: ({ children, className }) =>
                            className ? (
                              <code className="block rounded bg-background border px-2 py-1 text-xs font-mono mt-1 mb-1.5 overflow-x-auto">{children}</code>
                            ) : (
                              <code className="rounded bg-background border px-1 py-0.5 text-xs font-mono">{children}</code>
                            ),
                          blockquote: ({ children }) => <blockquote className="border-l-2 border-muted-foreground/30 pl-3 italic text-muted-foreground mb-1.5">{children}</blockquote>,
                          hr: () => <hr className="my-2 border-border" />,
                        }}
                      >
                        {text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your issues…"
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 min-h-[38px] max-h-[120px] overflow-y-auto"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <Button
              type="button"
              size="icon-sm"
              disabled={isLoading || !input.trim()}
              onClick={submit}
            >
              <SendHorizonal className="size-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
