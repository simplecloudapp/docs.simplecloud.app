"use client";
import type { TOCItemType } from "fumadocs-core/server";
import * as Primitive from "fumadocs-core/toc";
import {
  type ComponentProps,
  type HTMLAttributes,
  type ReactNode,
  useRef,
} from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { TocThumb } from "./toc-thumb";
import { ScrollArea, ScrollViewport } from "@/components/ui/scroll-area";
import { usePageStyles } from "fumadocs-ui/contexts/layout";

export interface TOCProps {
  /**
   * Custom content in TOC container, before the main TOC
   */
  header?: ReactNode;

  /**
   * Custom content in TOC container, after the main TOC
   */
  footer?: ReactNode;

  children: ReactNode;
}

export function Toc(props: HTMLAttributes<HTMLDivElement>) {
  const { toc } = usePageStyles();

  return (
    <div
      id="nd-toc"
      {...props}
      className={cn(
        "sticky top-[calc(var(--fd-banner-height)+var(--fd-nav-height))] h-(--fd-toc-height) pb-2 pt-12",
        toc,
        props.className
      )}
      style={
        {
          ...props.style,
          "--fd-toc-height":
            "calc(100dvh - var(--fd-banner-height) - var(--fd-nav-height))",
        } as object
      }
    >
      <div className="flex h-full w-(--fd-toc-width) max-w-full flex-col gap-3 pe-4">
        {props.children}
      </div>
    </div>
  );
}

export function TocItemsEmpty() {
  const { text } = useI18n();

  return (
    <div className="rounded-lg border bg-fd-card p-3 text-xs text-fd-muted-foreground">
      {text.tocNoHeadings}
    </div>
  );
}

export function TOCScrollArea({
  isMenu,
  ...props
}: ComponentProps<typeof ScrollArea> & { isMenu?: boolean }) {
  const viewRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollArea
      {...props}
      className={cn("flex flex-col ps-px", props.className)}
    >
      <ScrollViewport
        ref={viewRef}
        className={cn(
          "relative min-h-0 text-sm",
          isMenu &&
            "[mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] px-4 md:px-6 py-2"
        )}
      >
        <Primitive.ScrollProvider containerRef={viewRef}>
          {props.children}
        </Primitive.ScrollProvider>
      </ScrollViewport>
    </ScrollArea>
  );
}

export function TOCItems({ items }: { items: TOCItemType[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return <TocItemsEmpty />;

  return (
    <>
      <TocThumb
        containerRef={containerRef}
        className="absolute top-(--fd-top) h-(--fd-height) w-px bg-fd-primary transition-all"
      />
      <div
        ref={containerRef}
        className="flex flex-col border-s border-fd-foreground/10"
      >
        {items.map((item) => (
          <TOCItem key={item.url} item={item} />
        ))}
      </div>
    </>
  );
}

function TOCItem({ item }: { item: TOCItemType }) {
  return (
    <Primitive.TOCItem
      href={item.url}
      className={cn(
        "prose py-1.5 text-sm text-fd-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-fd-primary",
        item.depth <= 2 && "ps-3",
        item.depth === 3 && "ps-6",
        item.depth >= 4 && "ps-8"
      )}
    >
      {item.title}
    </Primitive.TOCItem>
  );
}
