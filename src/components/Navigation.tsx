'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'

import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { useSectionStore } from '@/components/SectionProvider'
import {Tag, TagColor} from '@/components/Tag'
import { remToPx } from '@/lib/remToPx'

interface NavGroup {
  title: string
  links: Array<{
    title: string
    href: string
    tag?: string,
    tagColor?: TagColor
  }>
}

function useInitialValue<T>(value: T, condition = true) {
  let initialValue = useRef(value).current
  return condition ? initialValue : value
}

function TopLevelNavItem({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <li className="md:hidden">
      <Link
        href={href}
        className="block py-1 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  )
}

function NavLink({
  href,
  children,
  tag,
  active = false,
  isAnchorLink = false,
    tagColor = "zinc",
}: {
  href: string
  children: React.ReactNode
  tag?: string
  active?: boolean
  isAnchorLink?: boolean
  tagColor?: TagColor
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pr-3 text-sm transition',
        isAnchorLink ? 'pl-7' : 'pl-4',
        active
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
      )}
    >
      <span className="truncate">{children}</span>
      {tag && (
        <Tag variant="small" color={tagColor}>
          {tag}
        </Tag>
      )}
    </Link>
  )
}

function VisibleSectionHighlight({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  let [sections, visibleSections] = useInitialValue(
    [
      useSectionStore((s) => s.sections),
      useSectionStore((s) => s.visibleSections),
    ],
    useIsInsideMobileNavigation(),
  )

  let isPresent = useIsPresent()
  let firstVisibleSectionIndex = Math.max(
    0,
    [{ id: '_top' }, ...sections].findIndex(
      (section) => section.id === visibleSections[0],
    ),
  )
  let itemHeight = remToPx(2)
  let height = isPresent
    ? Math.max(1, visibleSections.length) * itemHeight
    : itemHeight
  let top =
    group.links.findIndex((link) => link.href === pathname) * itemHeight +
    firstVisibleSectionIndex * itemHeight

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 top-0 bg-zinc-800/2.5 will-change-transform dark:bg-white/2.5"
      style={{ borderRadius: 8, height, top }}
    />
  )
}

function ActivePageMarker({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  let itemHeight = remToPx(2)
  let offset = remToPx(0.25)
  let activePageIndex = group.links.findIndex((link) => link.href === pathname)
  let top = offset + activePageIndex * itemHeight

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-sky-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  )
}

function NavigationGroup({
  group,
  className,
}: {
  group: NavGroup
  className?: string
}) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let [pathname, sections] = useInitialValue(
    [usePathname(), useSectionStore((s) => s.sections)],
    isInsideMobileNavigation,
  )

  let isActiveGroup =
    group.links.findIndex((link) => link.href === pathname) !== -1

  return (
    <li className={clsx('relative mt-6', className)}>
      <motion.h2
        layout="position"
        className="text-xs font-semibold text-zinc-900 dark:text-white"
      >
        {group.title}
      </motion.h2>
      <div className="relative mt-3 pl-2">
        <AnimatePresence initial={!isInsideMobileNavigation}>
          {isActiveGroup && (
            <VisibleSectionHighlight group={group} pathname={pathname} />
          )}
        </AnimatePresence>
        <motion.div
          layout
          className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
        />
        <AnimatePresence initial={false}>
          {isActiveGroup && (
            <ActivePageMarker group={group} pathname={pathname} />
          )}
        </AnimatePresence>
        <ul role="list" className="border-l border-transparent">
          {group.links.map((link) => (
            <motion.li key={link.href} layout="position" className="relative">
              <NavLink href={link.tag?.toLowerCase() == "soon" ? "/soon" : link.href} active={link.href === pathname} tag={link.tag} tagColor={link.tagColor ?? "sky"}>
                  {link.title}
              </NavLink>
              <AnimatePresence mode="popLayout" initial={false}>
                {link.href === pathname && sections.length > 0 && (
                  <motion.ul
                    role="list"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { delay: 0.1 },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.15 },
                    }}
                  >
                    {sections.map((section) => (
                      <li key={section.id}>
                        <NavLink
                          href={`${link.href}#${section.id}`}
                          tag={section.tag}
                          isAnchorLink
                        >
                          {section.title}
                        </NavLink>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </ul>
      </div>
    </li>
  )
}

export const navigation: Array<NavGroup> = [
  {
    title: 'Guides',
    links: [
      { title: 'Introduction', href: '/' },
      { title: 'Quickstart', href: '/quickstart' },
      { title: 'Structure', href: "/structure" },
      { title: 'Controller', href: "/controller" },
      { title: 'CLI', href: "/cli" },
      { title: 'Dashboard', href: '/dashboard' },
      { title: 'Comparison', href: '/comparison', tag: "Soon", tagColor: "rose" },
      { title: 'Troubleshooting', href: '/troubleshooting', tag: "Soon", tagColor: "rose" }
    ],
  },
  {
    title: 'Resources',
    links: [
      { title: 'Server Groups', href: "/resources/server-group" },
      { title: 'Servers', href: "/resources/server" },
      { title: 'Templates', href: "/resources/template" },
      { title: 'Permissions', href: "/resources/permissions" },
    ],
  },
  {
    title: 'Droplets',
    links: [
      { title: 'Overview', href: '/droplet' },
      { title: 'Server Host Droplet', href: '/droplet/serverhost' },
      { title: 'Player Droplet', href: '/droplet/player' },
      { title: 'Metrics Droplet', href: '/droplet/metrics', tag: "Soon", tagColor: "rose" },
      { title: 'Resource Pack Droplet', href: '/droplet/resourcepack', tag: "Soon", tagColor: "rose" },
    ],
  },
  {
    title: 'Plugins',
    links: [
      { title: 'Overview', href: '/plugin' },
      { title: 'Server Registration Plugin', href: '/plugin/server-registration', tag: "Proxy" },
      { title: 'Server Connection Plugin', href: '/plugin/server-connection', tag: "Proxy" },
      { title: 'Cloud Command Plugin', href: '/plugin/cloud-command', tag: "Proxy" },
      { title: 'Proxy Essentials Plugin', href: '/plugin/proxy-essentials', tag: "Proxy"  },
      { title: 'Notify Plugin', href: '/plugin/notify', tag: "Proxy" },
      { title: 'Prefixes Plugin', href: '/plugin/prefixes', tag: "Server", tagColor: "purple" },
      { title: 'Signs Plugin', href: '/plugin/signs', tag: "Server", tagColor: "purple"  },
      { title: 'NPCs Plugin', href: '/plugin/npcs', tag: "Server", tagColor: "purple"  },
      { title: 'Placeholders Plugin', href: '/plugin/placeholder', tag: "Server", tagColor: "purple" },
    ],
  },
  {
    title: 'API',
    links: [
      { title: 'Getting Started', href: '/api' },
      { title: 'Controller API', href: '/api/controller' },
      { title: 'Server Host Droplet API', href: '/api/droplet/server-host', tag: "Soon", tagColor: "rose" },
      { title: 'Player Droplet API', href: '/api/droplet/player' },
    ],
  },
]

export function Navigation(props: React.ComponentPropsWithoutRef<'nav'>) {
  return (
    <nav {...props}>
      <ul role="list">
        <TopLevelNavItem href="/changelog">Changelog</TopLevelNavItem>
        <TopLevelNavItem href="/">Documentation</TopLevelNavItem>
        <TopLevelNavItem href="https://github.com/theSimpleCloud">Github</TopLevelNavItem>
        <TopLevelNavItem href="https://discord.simplecloud.app">Discord</TopLevelNavItem>
        {navigation.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 ? 'md:mt-0' : ''}
          />
        ))}
      </ul>
    </nav>
  )
}
