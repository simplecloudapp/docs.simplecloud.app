import { Fragment, type HTMLAttributes, type ReactNode, useMemo } from "react";
import { type BaseLayoutProps, getLinks, slot, slots } from "./shared";
import {
  CollapsibleSidebar,
  Sidebar,
  SidebarCollapseTrigger,
  SidebarFooter,
  SidebarHeader,
  SidebarPageTree,
  SidebarViewport,
} from "../layout/sidebar";
import { TreeContextProvider } from "fumadocs-ui/contexts/tree";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ChevronDown, Languages, SidebarIcon } from "lucide-react";
import { BaseLinkItem, type LinkItemType } from "./links";
import { LanguageToggle } from "../layout/language-toggle";
import { ThemeToggle } from "../layout/theme-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getSidebarTabsFromOptions,
  layoutVariables,
  SidebarLinkItem,
  type SidebarOptions,
} from "./docs/shared";
import type { PageTree } from "fumadocs-core/server";
import {
  LayoutTab,
  LayoutTabs,
  Navbar,
  NavbarSidebarTrigger,
  SidebarLayoutTab,
} from "./notebook-client";
import {
  NavProvider,
  type PageStyles,
  StylesProvider,
} from "fumadocs-ui/contexts/layout";
import { type Option, RootToggle } from "../layout/root-toggle";
import Link from "fumadocs-core/link";
import { LargeSearchToggle, SearchToggle } from "../layout/search-toggle";
import { GithubInfo } from "@/components/github-info";
import { ClientOnly } from "remix-utils/client-only";

export interface DocsLayoutProps extends BaseLayoutProps {
  tree: PageTree.Root;
  tabMode?: "sidebar" | "navbar";

  nav?: BaseLayoutProps["nav"] & {
    mode?: "top" | "auto";
  };

  sidebar?: Omit<Partial<SidebarOptions>, "component" | "enabled">;

  containerProps?: HTMLAttributes<HTMLDivElement>;
}

export function DocsLayout({
  tabMode = "sidebar",
  nav: { transparentMode, ...nav } = {},
  sidebar: {
    collapsible: sidebarCollapsible = true,
    tabs: tabOptions,
    banner: sidebarBanner,
    footer: sidebarFooter,
    components: sidebarComponents,
    ...sidebar
  } = {},
  i18n = false,
  disableThemeSwitch = false,
  themeSwitch = { enabled: !disableThemeSwitch },
  searchToggle,
  ...props
}: DocsLayoutProps) {
  const navMode = nav.mode ?? "auto";
  const links = getLinks(props.links ?? [], props.githubUrl);
  const tabs = useMemo(
    () => getSidebarTabsFromOptions(tabOptions, props.tree) ?? [],
    [tabOptions, props.tree]
  );

  const Aside = sidebarCollapsible ? CollapsibleSidebar : Sidebar;

  const variables = cn(
    "[--fd-nav-height:calc(var(--spacing)*14)] [--fd-tocnav-height:36px] md:[--fd-sidebar-width:286px] xl:[--fd-toc-width:286px] xl:[--fd-tocnav-height:0px]",
    tabs.length > 0 &&
      tabMode === "navbar" &&
      "lg:[--fd-nav-height:calc(var(--spacing)*24)]"
  );

  const pageStyles: PageStyles = {
    tocNav: cn("xl:hidden"),
    toc: cn("max-xl:hidden"),
    page: cn("mt-(--fd-nav-height)"),
  };

  return (
    <TreeContextProvider tree={props.tree}>
      <NavProvider transparentMode={transparentMode}>
        <main
          id="nd-docs-layout"
          {...props.containerProps}
          className={cn(
            "flex w-full flex-1 flex-row pe-(--fd-layout-offset)",
            variables,
            navMode === "top" && "xl:container xl:mx-auto xl:px-2 px-4",
            props.containerProps?.className
          )}
          style={{
            ...layoutVariables,
            ...props.containerProps?.style,
          }}
        >
          <DocsNavbar
            mode={nav.mode}
            nav={
              <Link
                href={nav.url ?? "/"}
                className={cn(
                  "inline-flex items-center gap-2.5 font-semibold px-2",
                  navMode === "auto" && "md:hidden"
                )}
              >
                {nav.title}
              </Link>
            }
            links={links}
            i18n={i18n}
            sidebarCollapsible={sidebarCollapsible}
            searchToggle={searchToggle}
            tabs={tabMode == "navbar" ? tabs : []}
          >
            {nav.children}
          </DocsNavbar>
          <Aside
            {...sidebar}
            className={cn(
              "md:ps-(--fd-layout-offset)",
              navMode === "top" ? "bg-transparent" : "md:[--fd-nav-height:0px]",
              sidebar.className
            )}
            inner={{
              className: cn(
                navMode === "top" ? "md:pt-2.5" : "md:pt-3.5",
                tabMode === "navbar" && "md:pt-0"
              ),
            }}
          >
            <SidebarHeader>
              {navMode === "auto" && (
                <div className="flex flex-row justify-between max-md:hidden">
                  <Link
                    href={nav.url ?? "/"}
                    className="inline-flex items-center gap-2.5 font-medium"
                  >
                    {nav.title}
                  </Link>
                  <SidebarCollapseTrigger
                    className={cn(
                      buttonVariants({
                        variant: "ghost",
                        size: "icon-sm",
                      }),
                      "text-fd-muted-foreground mb-auto"
                    )}
                  >
                    <SidebarIcon />
                  </SidebarCollapseTrigger>
                </div>
              )}
              {nav.children}
              {sidebarBanner}
              {tabMode === "sidebar" && tabs.length > 0 ? (
                <RootToggle options={tabs} />
              ) : null}
            </SidebarHeader>
            <SidebarViewport>
              {tabMode === "navbar" &&
                tabs.map((tab, i) => (
                  <SidebarLayoutTab
                    key={tab.url}
                    item={tab}
                    className={cn(
                      "px-4 lg:hidden",
                      i === tabs.length - 1 && "mb-4"
                    )}
                  />
                ))}
              {links.map((item, i) => (
                <SidebarLinkItem
                  key={i}
                  item={item}
                  className={cn("lg:hidden", i === links.length - 1 && "mb-4")}
                />
              ))}

              <SidebarPageTree components={sidebarComponents} />
            </SidebarViewport>
            <SidebarFooter
              className={cn(
                "flex flex-row items-center",
                !sidebarFooter && "md:hidden"
              )}
            >
              {i18n ? (
                <LanguageToggle className="me-auto md:hidden">
                  <Languages className="size-5 text-fd-muted-foreground" />
                </LanguageToggle>
              ) : null}
              {slot(
                themeSwitch,
                <ThemeToggle
                  className="md:hidden"
                  mode={themeSwitch?.mode ?? "light-dark-system"}
                />
              )}
              {sidebarFooter}
            </SidebarFooter>
          </Aside>
          <StylesProvider {...pageStyles}>{props.children}</StylesProvider>
        </main>
      </NavProvider>
    </TreeContextProvider>
  );
}

function DocsNavbar({
  mode: navMode = "auto",
  nav,
  sidebarCollapsible = false,
  links,
  themeSwitch,
  searchToggle,
  i18n = false,
  tabs,
  children,
}: {
  mode?: "top" | "auto";
  nav?: ReactNode;
  sidebarCollapsible?: boolean;

  i18n?: DocsLayoutProps["i18n"];
  themeSwitch?: DocsLayoutProps["themeSwitch"];
  searchToggle?: DocsLayoutProps["searchToggle"];

  links: LinkItemType[];
  tabs: Option[];
  children?: ReactNode;
}) {
  return (
    <Navbar mode={navMode}>
      <div
        className={cn(
          "flex flex-row border-b border-fd-foreground/10 px-4 xl:px-0 h-14",
          navMode === "auto" && "md:px-6"
        )}
      >
        <div
          className={cn(
            "flex flex-row items-center",
            navMode === "top" && "flex-1 pe-4 xl:-ml-2"
          )}
        >
          {sidebarCollapsible && navMode === "auto" ? (
            <SidebarCollapseTrigger
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "icon-sm",
                }),
                "text-fd-muted-foreground -ms-1.5 me-2 data-[collapsed=false]:hidden max-md:hidden"
              )}
            >
              <SidebarIcon />
            </SidebarCollapseTrigger>
          ) : null}
          {nav}
        </div>
        {slots(
          "lg",
          searchToggle,
          <LargeSearchToggle
            hideIfDisabled
            className={cn(
              "w-full my-auto rounded-xl max-md:hidden",
              navMode === "top" ? "max-w-sm px-2" : "max-w-[240px]"
            )}
          />
        )}
        <div className="flex flex-1 flex-row items-center justify-end">
          <div className="flex flex-row items-center gap-6 px-4 empty:hidden max-lg:hidden">
            {links
              .filter((item) => item.type !== "icon")
              .map((item, i) => (
                <NavbarLinkItem
                  key={i}
                  item={item}
                  className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground"
                />
              ))}
          </div>
          {children}
          {slots(
            "sm",
            searchToggle,
            <SearchToggle hideIfDisabled className="md:hidden" />
          )}
          <GithubInfo
            owner="simplecloudapp"
            repo="v3-releases"
            className="hidden md:flex"
          />
          <NavbarSidebarTrigger className="-me-1.5 md:hidden" />
          {links
            .filter((item) => item.type === "icon")
            .map((item, i) => (
              <BaseLinkItem
                key={i}
                item={item}
                className={cn(
                  buttonVariants({ size: "icon-sm", variant: "ghost" }),
                  "text-fd-muted-foreground max-lg:hidden"
                )}
                aria-label={item.label}
              >
                {item.icon}
              </BaseLinkItem>
            ))}
          {i18n ? (
            <LanguageToggle className="max-md:hidden">
              <Languages className="size-4.5 text-fd-muted-foreground" />
            </LanguageToggle>
          ) : null}
          {slot(
            themeSwitch,
            <ThemeToggle
              className="ms-2 max-md:hidden"
              mode={themeSwitch?.mode ?? "light-dark-system"}
            />
          )}
          {sidebarCollapsible && navMode === "top" ? (
            <SidebarCollapseTrigger
              className={cn(
                buttonVariants({
                  variant: "secondary",
                  size: "icon-sm",
                }),
                "ms-2 text-fd-muted-foreground rounded-full max-md:hidden"
              )}
            >
              <SidebarIcon />
            </SidebarCollapseTrigger>
          ) : null}
        </div>
      </div>
      {tabs.length > 0 ? (
        <div className="relative w-screen -mx-[50vw] left-1/2 right-1/2">
          <LayoutTabs className="h-10 max-lg:hidden xl:container xl:mx-auto px-6">
            {tabs.map((tab) => (
              <LayoutTab key={tab.url} {...tab} />
            ))}
          </LayoutTabs>
          <div className="absolute inset-x-0 border-b border-fd-foreground/10" />
        </div>
      ) : null}
    </Navbar>
  );
}

function NavbarLinkItem({
  item,
  ...props
}: { item: LinkItemType } & HTMLAttributes<HTMLElement>) {
  if (item.type === "menu") {
    return (
      <Popover>
        <PopoverTrigger
          {...props}
          className={cn("inline-flex items-center gap-1.5", props.className)}
        >
          {item.text}
          <ChevronDown className="size-3" />
        </PopoverTrigger>
        <PopoverContent className="flex flex-col">
          {item.items.map((child, i) => {
            if (child.type === "custom")
              return <Fragment key={i}>{child.children}</Fragment>;

            return (
              <BaseLinkItem
                key={i}
                item={child}
                className="inline-flex items-center gap-2 rounded-md p-2 text-start hover:bg-fd-accent hover:text-fd-accent-foreground data-[active=true]:text-fd-primary [&_svg]:size-4"
              >
                {child.icon}
                {child.text}
              </BaseLinkItem>
            );
          })}
        </PopoverContent>
      </Popover>
    );
  }

  if (item.type === "custom") return item.children;

  return (
    <BaseLinkItem item={item} {...props}>
      {item.text}
    </BaseLinkItem>
  );
}

export { Navbar, NavbarSidebarTrigger };
