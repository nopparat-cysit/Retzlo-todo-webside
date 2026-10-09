import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a safe subset of Markdown produced by the AI assistant
 * (headings, bold, inline code, bullet and numbered lists) as React nodes.
 * Never uses innerHTML, so model output cannot inject markup.
 */

type Block =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; lines: string[] }
  | { kind: "bullets"; items: string[] }
  | { kind: "numbers"; items: string[] };

const BULLET_PATTERN = /^\s*[-*•]\s+(.*)$/;
const NUMBER_PATTERN = /^\s*\d+[.)]\s+(.*)$/;
const HEADING_PATTERN = /^\s*#{1,6}\s+(.*)$/;

export function parseAiMessageBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  for (const line of lines) {
    const last = blocks[blocks.length - 1];
    const heading = line.match(HEADING_PATTERN);
    const bullet = line.match(BULLET_PATTERN);
    const numbered = line.match(NUMBER_PATTERN);

    if (!line.trim()) {
      blocks.push({ kind: "paragraph", lines: [] });
      continue;
    }
    if (heading) {
      blocks.push({ kind: "heading", text: heading[1] });
      continue;
    }
    if (bullet) {
      if (last?.kind === "bullets") last.items.push(bullet[1]);
      else blocks.push({ kind: "bullets", items: [bullet[1]] });
      continue;
    }
    if (numbered) {
      if (last?.kind === "numbers") last.items.push(numbered[1]);
      else blocks.push({ kind: "numbers", items: [numbered[1]] });
      continue;
    }
    if (last?.kind === "paragraph" && last.lines.length > 0) last.lines.push(line);
    else blocks.push({ kind: "paragraph", lines: [line] });
  }

  return blocks.filter((block) => block.kind !== "paragraph" || block.lines.length > 0);
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-theme-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={index}
          className="rounded border border-theme-border bg-theme-paper px-1 py-px font-mono text-[0.85em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

interface AiMessageContentProps {
  content: string;
  className?: string;
}

export function AiMessageContent({ content, className }: AiMessageContentProps) {
  const blocks = parseAiMessageBlocks(content);

  return (
    <div className={cn("space-y-2 break-words", className)}>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "heading":
            return (
              <p key={index} className="pt-1 text-[13px] font-semibold text-theme-foreground">
                {renderInline(block.text)}
              </p>
            );
          case "bullets":
            return (
              <ul key={index} className="space-y-1 pl-1">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex gap-2">
                    <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-theme-muted" />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "numbers":
            return (
              <ol key={index} className="space-y-1 pl-1">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex gap-2">
                    <span className="w-4 shrink-0 text-right font-mono text-[11px] leading-[1.7] text-theme-muted">
                      {itemIndex + 1}.
                    </span>
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ol>
            );
          default:
            return (
              <p key={index} className="whitespace-pre-wrap">
                {block.lines.map((line, lineIndex) => (
                  <Fragment key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    {renderInline(line)}
                  </Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
