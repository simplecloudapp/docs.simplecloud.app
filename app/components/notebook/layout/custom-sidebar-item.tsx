import { SidebarItem } from "@/components/notebook/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import type { PageTree } from "fumadocs-core/server";
import type { FC } from "react";

export const CustomSidebarItem: FC<{ item: PageTree.Item }> = ({ item }) => {
  const isSoon = (item as any).soon === true;
  const badge = (item as any).badge;
  const badgeColor = (item as any).badgeColor;

  return (
    <SidebarItem href={item.url} external={item.external} icon={item.icon}>
      <div className="flex items-center gap-4 w-full justify-between">
        {item.name}
        {isSoon && !badge && <Badge color="rose">Soon</Badge>}
        {badge && <Badge color={badgeColor}>{badge}</Badge>}
      </div>
    </SidebarItem>
  );
};
